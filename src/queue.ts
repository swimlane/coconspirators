import * as amqp from 'amqplib';
import { EventEmitter } from 'events';
import * as shortid from 'shortid';

import { AmqpClient } from './client';
import {
    NAME_KEY, PublishOptions, QueueOptions, ReplyableMessage, ReplyOptions, SubscribeOptions
} from './types';

export class AmqpQueue<T = Buffer> extends EventEmitter {

  channel: Promise<amqp.ConfirmChannel>;
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

    // do we need our own channel?
    if (this.options.channel) {
      this.channel = this.client.createChannel(this.options.channel);
    } else {
      this.channel = this.client.channel;
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
    callback: (message: ReplyableMessage<T>) => void,
    options: SubscribeOptions = {}
  ): Promise<amqp.Replies.Consume> {
    const chnl = await this.channel;
    const opts: any = { ...this.options, ...options };

    return chnl.consume(this.options.name || '', async (message: ReplyableMessage<T>) => {
      if(opts.contentType === 'application/json') {
        message.body = JSON.parse(message.content.toString());
      }

      message.reply = (content: any) => {
        return this.reply(content, {
          replyTo: message.properties.replyTo,
          correlationId: message.properties.correlationId
        });
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
  async publish(content: any, options: PublishOptions = {}): Promise<{ content: any; properties: PublishOptions }> {
    const chnl = await this.channel;
    const opts: any = { ...this.options, ...options};

    if(this.rpcQueue) {
      opts.correlationId = shortid.generate();
      opts.replyTo = (await this.rpcQueue).queue;
    }

    if(opts.contentType === 'application/json') {
      const json = JSON.stringify(content);
      content = new Buffer(json);
    }

    const exchange = options.exchangeOverride === '' || options.exchangeOverride ?
      options.exchangeOverride :
      this.options.exchange;

    chnl.publish(
      exchange || '',
      options.routingKey || this.options.name || '',
      content,
      opts
    );

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
  async reply(content: any, options: ReplyOptions): Promise<{ content: any, properties: ReplyOptions }> {
    const chnl = await this.channel;

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
   * Bind queue to exchange
   *
   * @param {string} queue
   * @param {string} routingKey
   * @param {*} [opts={}]
   * @memberOf AmqpQueue
   */
  async bindQueue(queue: string, routingKey: string, opts: any = {}) {
    const chnl = await this.channel;

    await chnl.bindQueue(queue, this.options.exchange || '', routingKey, opts);

    return {
      queue,
      exchange: this.options.exchange || '',
      routingKey
    };
  }

  /**
   * Unbind queue from exchange
   *
   * @param {string} queue
   * @param {string} routingKey
   * @param {*} [opts={}]
   * @memberOf AmqpQueue
   */
  async unbindQueue(queue: string, routingKey: string, opts: any = {}) {
    const chnl = await this.channel;

    await chnl.unbindQueue(queue, this.options.exchange || '', routingKey, opts);

    return {
      queue,
      exchange: this.options.exchange || '',
      routingKey
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
    const chnl = await this.channel;
    chnl.ack(message);
  }

  /**
   * Purge the queue
   *
   * @returns {Promise<amqp.Replies.PurgeQueue>}
   * @memberof AmqpQueue
   */
  async purge(): Promise<amqp.Replies.PurgeQueue> {
    const chnl = await this.channel;
    return chnl.purgeQueue(this.options.name || '');
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
        const chnl = await this.channel;
        const queue = await chnl.assertQueue(this.options.name || '', this.options);

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

    const chnl = await this.channel;
    // Wrap Bluebird in native Promise
    this.rpcQueue = new Promise<amqp.Replies.AssertQueue>((resolve, reject) => {
      chnl.assertQueue('', {
        exclusive: this.options.exclusive
      }).then(resolve, reject);
    });

    chnl.consume((await this.rpcQueue).queue, (result) => {
      if (result) this.emit(result.properties.correlationId, result);
    }, { noAck: true });
  }

}
