import * as amqp from 'amqplib';
import { EventEmitter } from 'events';

import { AmqpClient } from './client';
import { ExchangeOptions, NAME_KEY } from './types';

export class AmqpExchange<T> extends EventEmitter {

  channel: Promise<amqp.ConfirmChannel>;
  exchange: Promise<amqp.Replies.AssertExchange>;
  name: string;
  options: ExchangeOptions;

  /**
   * Creates an instance of AmqpExchange.
   * @param {AmqpClient} client
   * @param {QueueOptions} [options]
   * @memberof AmqpExchange
   */
  constructor(private client: AmqpClient, options?: ExchangeOptions) {
    super();

    // if decorated, get decorations and merge
    const metadata = Reflect.getMetadata(NAME_KEY, this);
    if (metadata) {
      this.options =  metadata;
    }

    // if options passed in manually, extend options
    if (options) {
      Object.assign(this.options, options);
    }

    this.name = this.options.name;

    // do we need our own channel?
    if (this.options.channel) {
      this.channel = this.client.createChannel(this.options.channel);
    } else {
      this.channel = client.channel;
    }

    this.exchange = this.createExchange();
  }

  /**
   * Publish a message to the Exchange
   *
   * @param {T} content The content of the message
   * @param {string} [routingKey=''] The routing key for the message
   * @param {amqp.Options.Publish} [options={}] Any options added to message
   * @returns {Promise<boolean>} True if message accepted, false if write buffer is full
   * @memberof AmqpExchange
   */
  async publish(
    content: T,
    routingKey: string = '',
    options: amqp.Options.Publish = {}
  ): Promise<boolean> {
    const chnl = await this.channel;
    await this.exchange; // wait for exchange to be asserted

    let buf: Buffer;
    if(this.options.contentType === 'application/json') {
      const json = JSON.stringify(content);
      buf = new Buffer(json);
    } else {
      buf = new Buffer(content.toString());
    }

    return chnl.publish(
      this.name,
      routingKey,
      buf,
      options
    );
  }

  /**
   * Deletes the exchange
   *
   * @param {amqp.Options.DeleteExchange} [options] { ifUnused: true|false }
   * @returns {Promise<void>}
   * @memberof AmqpExchange
   */
  async deleteExchange(options?: amqp.Options.DeleteExchange): Promise<void> {
    const chnl = await this.channel;
    await this.exchange; // wait for exchange to be asserted

    await chnl.deleteExchange(this.name, options);
  }

  /**
   * Bind this exchange to another exchange
   *
   * @param {string} destination The name of the destination exchange
   * @param {string} pattern The pattern to match messages to send
   * @param {*} [args] Any arguments (headers, etc)
   * @returns {Promise<void>}
   * @memberof AmqpExchange
   */
  async bindExchange(destination: string, pattern: string, args?: any): Promise<void> {
    const chnl = await this.channel;
    await this.exchange; // wait for exchange to be asserted
    await chnl.bindExchange(destination, this.name, pattern, args);
  }

  /**
   * Unbind an exchange to this exchange
   * The destination, pattern, and args must match those given when exchange was bound
   *
   * @param {string} destination The name of the destination exchange
   * @param {string} pattern The pattern to match message to send
   * @param {*} [args] Any arguments (headers, etc)
   * @returns {Promise<void>}
   * @memberof AmqpExchange
   */
  async unbindExchange(destination: string, pattern: string, args?: any): Promise<void> {
    const chnl = await this.channel;
    await this.exchange; // wait for exchange to be asserted
    await chnl.unbindExchange(destination, this.name, pattern, args);
  }

  /**
   * Bind a queue to this exchange
   *
   * @param {string} queue The name of the queue
   * @param {string} pattern The pattern to match message to send
   * @param {*} [args] Any arguements (headers, etc)
   * @returns {Promise<void>}
   * @memberof AmqpExchange
   */
  async bindQueue(queue: string, pattern: string, args?: any): Promise<void> {
    const chnl = await this.channel;
    await this.exchange; // wait for exchange to be asserted
    await chnl.bindQueue(queue, this.name, pattern, args);
  }

  /**
   * Unbind a queue to this exchange
   * The destination, pattern, and args must match those given when queue was bound
   *
   * @param {string} queue The name of the queue
   * @param {string} pattern The pattern to match message to send
   * @param {*} [args] Any arguements (headers, etc)
   * @returns {Promise<amqp.Replies.Empty>}
   * @memberof AmqpExchange
   */
  async unbindQueue(queue: string, pattern: string, args?: any): Promise<void> {
    const chnl = await this.channel;
    await this.exchange; // wait for exchange to be asserted
    await chnl.unbindQueue(queue, this.name, pattern, args);
  }

  /**
   * Create the Exchange
   *
   * @private
   * @returns {Promise<amqp.Replies.AssertExchange>}
   * @memberof AmqpExchange
   */
  private createExchange(): Promise<amqp.Replies.AssertExchange> {
    return new Promise(async (resolve, reject) => {
      try {
        const chnl = await this.channel;
        const exchange = await chnl.assertExchange(this.options.name, this.options.type, this.options);

        resolve(exchange);
      } catch(e) {
        reject(e);
      }
    });
  }

}
