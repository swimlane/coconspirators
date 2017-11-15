import { EventEmitter } from 'events';
import { AmqpClient } from './client';
import { NAME_KEY, QueueOptions, PublishOptions, SubscribeOptions, ReplyOptions, ReplyableMessage } from './types';
import * as amqp from 'amqplib';
import * as shortid from 'shortid';

export class AmqpQueue<T> extends EventEmitter {

  queue: Promise<amqp.Replies.AssertQueue>;
  rpcQueue: Promise<amqp.Replies.AssertQueue>;
  options: QueueOptions = {
    exchange: '',
    durable: false,
    noAck: true
  };

  /**
   * Creates an instance of AmqpQueue.
   * @param {AmqpClient} client
   * @param {QueueOptions} [options]
   * @memberof AmqpQueue
   */
  constructor(private client: AmqpClient, options?: QueueOptions) {
    super();

    // if decorated, get decorations and merge
    const metadata = Reflect.getMetadata(NAME_KEY, this);
    if(metadata) {
      Object.assign(this.options, metadata);
    }

    // if options passed in manually, extend options
    if(options) {
      Object.assign(this.options, options);
    }

    this.queue = this.createQueue();
  }

  /**
   * Subscribe to a channel
   *
   * @param {(message: ReplyableMessage) => void} callback
   * @param {SubscribeOptions} [options={}]
   * @returns {Promise<amqp.Replies.Consume>}
   * @memberof AmqpQueue
   */
  async subscribe(
    callback: (message: ReplyableMessage) => void,
    options: SubscribeOptions = {}
  ): Promise<amqp.Replies.Consume> {
    const chnl = await this.client.channel;
    const opts: any = { ...this.options, ...options };

    if (options.prefetch) {
      chnl.prefetch(options.prefetch);
    }

    return chnl.consume(this.options.name, async (message: ReplyableMessage) => {
      if(opts.contentType === 'application/json') {
        message.content = JSON.parse(message.content.toString());
      }

      message.reply = (content: any, replyOptions: ReplyOptions = {}) => {
        replyOptions.replyTo = message.properties.replyTo;
        replyOptions.correlationId = message.properties.correlationId;
        return this.reply(content, replyOptions);
      };

      message.ack = () => {
        this.ack(message);
      };

      callback(message);
    }, opts);
  }

  /**
   * Publish content to a queue
   *
   * @param {*} content
   * @param {PublishOptions} [options={}]
   * @returns {Promise<{ content: any; properties: PublishOptions }>}
   * @memberof AmqpQueue
   */
  // tslint:disable-next-line:max-line-length
  async publish(content: any, options: PublishOptions = {}): Promise<{ content: any; properties: PublishOptions }> {
    const chnl = await this.client.channel;
    const opts: any = { ...this.options, ...options};

    if(this.rpcQueue) {
      opts.correlationId = shortid.generate();
      opts.replyTo = (await this.rpcQueue).queue;
    }

    if(opts.contentType === 'application/json') {
      const json = JSON.stringify(content);
      content = new Buffer(json);
    }

    chnl.publish(this.options.exchange, options.routingKey || this.options.name, content, opts);

    return {
      content,
      properties: opts
    };
  }

  /**
   * Reply to a message by id or message
   *
   * @param {(string|amqp.Message)} idOrMessage
   * @returns {Promise<amqp.Message>}
   * @memberof AmqpQueue
   */
  async replyOf(idOrMessage: string|amqp.Message): Promise<amqp.Message> {
    const id = typeof idOrMessage !== 'string' ? (idOrMessage as amqp.Message).properties.correlationId : idOrMessage;

    return new Promise<amqp.Message>((resolve, reject) => {
      this.once(id, (message: amqp.Message) => {
        if(this.options.contentType === 'application/json') {
          try {
            message.content = JSON.parse(message.content.toString());
          } catch(e) { /* do nothing */ }
        }
        resolve(message);
      });
    });
  }

  /**
   * Reply to a channel
   *
   * @param {*} content
   * @param {ReplyOptions} [options={}]
   * @returns {Promise<{ content: any, properties: ReplyOptions }>}
   * @memberof AmqpQueue
   */
  async reply(content: any, options: ReplyOptions = {}): Promise<{ content: any, properties: ReplyOptions }> {
    const chnl = await this.client.channel;

    if(this.options.contentType === 'application/json') {
      const json = JSON.stringify(content);
      content = new Buffer(json);
    }

    chnl.sendToQueue(options.replyTo, content, options);

    return {
      content,
      properties: options
    };
  }

  /**
   * Acknowledge a message
   *
   * @param {amqp.Message} message
   * @returns {Promise<void>}
   * @memberof AmqpQueue
   */
  async ack(message: amqp.Message): Promise<void> {
    const chnl = await this.client.channel;
    chnl.ack(message);
  }

  /**
   * Purge the queue
   *
   * @returns {Promise<amqp.Replies.PurgeQueue>}
   * @memberof AmqpQueue
   */
  async purge(): Promise<amqp.Replies.PurgeQueue> {
    const chnl = await this.client.channel;
    return chnl.purgeQueue(this.options.name);
  }

  /**
   * Create a queue
   *
   * @private
   * @returns {Promise<amqp.Replies.AssertQueue>}
   * @memberof AmqpQueue
   */
  private createQueue(): Promise<amqp.Replies.AssertQueue> {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = await this.client.connection;
        const chnl = await this.client.channel;
        const queue = await chnl.assertQueue(this.options.name, this.options);

        await this.consumeReplies();
        resolve(queue);
      } catch(e) {
        reject(e);
      }
    });
  }

  /**
   * Consume any replies on the queue
   *
   * @private
   * @returns {Promise<void>}
   * @memberof AmqpQueue
   */
  private async consumeReplies(): Promise<void> {
    if(!this.options.rpc) return;

    const chnl = await this.client.channel;
    // Wrap Bluebird in native Promise
    this.rpcQueue = new Promise<amqp.Replies.AssertQueue>((resolve, reject) => {
      chnl.assertQueue('', {
        exclusive: this.options.exclusive
      }).then(resolve, reject);
    });

    chnl.consume((await this.rpcQueue).queue, (result) => {
      this.emit(result.properties.correlationId, result);
    }, { noAck: true });
  }

}
