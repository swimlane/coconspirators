import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import { Queue } from './queue';

/**
 * RabbitMQ Client
 * 
 * @export
 * @class Rabbit
 * @extends {EventEmitter}
 */
export class Rabbit extends EventEmitter {

  channel: any;
  connection: amqp.Connection;
  queues: any = {};
  options: any;

  get logger() {
    if(this.options.logger) return this.options.logger;
    return console;
  }

  constructor(options: any = {}) {
    super();

    this.options = Object.assign({
      connectImmediately: true, 
      url: 'amqp://localhost:5672'
    }, options);
    
    if(this.options.connectImmediately) {
      this.connection = this.connect();
    }
  }

  async connect() {
    if(this.connection) return this.connection;

    const connectionStr = this.options.url;
    this.connection = await this.createConnection(connectionStr);
    this.channel = await this.createChannel(this.connection);

    return this.connection;
  }

  async reconnect() {
    await this.disconnect();
    return this.connect();
  }

  disconnect() {
    return this.connection.close();
  }

  async subscribe(name: string, callback: Function, ...middlewares: Function[]) {
    const queue = await this.queue(name);
    return queue.subscribe(name, callback);
  }

  async purge(name) {
    const queue = await this.queues(name);
    return queue.purge();
  }

  async unsubscribe(name) {
    const queue = await this.queues(name);
    return queue.unsubscribe();
  }

  async publish(name: string, message: any, options: any = {}) {
    const queue = await this.queue(name);
    this.logger.info(`Rabbit: Sending message to queue ${name}`, message);
    return queue.publish(message, options);
  }

  async replyOf(name: string, correlationId: string): Promise<any> {
    const replyName = `${name}_reply`;
    const queue = await this.queue(replyName);
    
    return new Promise((resolve) => {
      queue.subscribe(replyName, (msg) => {
        if(msg.properties.correlationId === correlationId) {
          resolve(msg);
        }
      }, { noAck: true });
    });
  }

  queue(name: string, options: any = {}, ...middlewares: any[]): Promise<any> {
    if(!this.queues[name]) {
      this.queues[name] = new Promise(async resolve => {
        const conn = await this.connection;
        const chnl = await this.channel;
        const queue = new Queue(chnl, name, options, ...middlewares);
        await queue.initialize();

        if(options.reply) {
          const replyName = `${name}_reply`;
          const replyQueue = new Queue(chnl, '', { exclusive: true }, ...middlewares);
          await replyQueue.initialize();
          this.queue[replyName] = replyQueue;
        }

        resolve(queue);
      });
    }

    return this.queues[name];
  }

  private async createConnection(connectionStr: string) {
    const connection = await amqp.connect(connectionStr);

    connection.once('close', (err) => {
      this.logger.warn('Rabbit: Connection closed', err);
      this.emit('disconnected', err);
    });

    connection.on('error', (err) => {
      this.logger.error('Rabbit: Channel connection error', err);
      this.emit('disconnected', err);
    });

    this.logger.info(`Rabbit: Connection opened: ${connectionStr}`);

    process.on('SIGINT', () => {
      connection.close(() => {
        this.logger.warn('Rabbit: Connection closed through app termination');
        this.emit('disconnected');
        process.exit(0);
      });
    });

    return connection;
  }

  private async createChannel(connection) {
    const channel = connection.createConfirmChannel();
    this.emit('connected');
    return channel;
  }

}
