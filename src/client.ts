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
  middlewares: any[] = [];

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

    this.channel.consume('amq.rabbitmq.reply-to', (result) => {
      this.emit(result.properties.correlationId, result);
    }, { noAck: true });

    return this.connection;
  }

  async reconnect() {
    await this.disconnect();
    return this.connect();
  }

  use(middleware: any) {
    this.middlewares.push(middleware);
  }

  disconnect() {
    return this.connection.close();
  }

  async subscribe(name: string, callback: Function, options: any = {}) {
    const queue = await this.queue(name);
    return queue.subscribe(callback, options);
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

  queue(name: string, options: any = {},  ...middlewares: any[]): Promise<any> {
    if(!this.queues[name]) {
      this.queues[name] = new Promise(async resolve => {
        const conn = await this.connection;
        const chnl = await this.channel;

        const mw = this.middlewares;
        if(middlewares) mw.concat(middlewares);
        
        const queue = new Queue(chnl, name, options, ...mw);
        await queue.initialize();
        
        resolve(queue);
      });
    }

    return this.queues[name];
  }

  async replyOf(correlationId: string): Promise<any> {
    return new Promise(async (resolve) => {

      this.once(correlationId, async (message) => {
        let response = message.content;
        if(this.middlewares) {
          for(const mw of this.middlewares) {
            if(mw.subscribe) response = await mw.subscribe(response);
          }
        }

        resolve({ message, response });
      });
    });
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
