import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import * as retry from 'retry';
import { defer, ExternalDeferPromise } from './util';

export class AmqpClient extends EventEmitter {

  connection: ExternalDeferPromise<amqp.Connection>;
  channel: ExternalDeferPromise<amqp.ConfirmChannel>;
  uri: string;

  /**
   * Creates an instance of AmqpClient.
   *
   * @memberof AmqpClient
   */
  constructor() {
    super();
    this.connection = defer<amqp.Connection>();
    this.channel = defer<amqp.ConfirmChannel>();
  }

  /**
   * Connect to the queue
   *
   * @param {string} [uri='amqp://localhost:5672']
   * @returns {Promise<amqp.Connection>}
   * @memberof AmqpClient
   */
  connect(uri: string = 'amqp://localhost:5672'): Promise<amqp.Connection> {
    this.uri = uri;

    this.createConnection(this.uri);
    this.createChannel();

    return this.connection;
  }

  /**
   * Reconnect to the queue
   *
   * @returns {Promise<amqp.Connection>}
   * @memberof AmqpClient
   */
  async reconnect(): Promise<amqp.Connection> {
    await this.disconnect();
    return this.connect(this.uri);
  }

  /**
   * Disconnect from the queue
   *
   * @returns {Promise<void>}
   * @memberof AmqpClient
   */
  async disconnect(): Promise<void> {
    if(!this.connection) {
      throw new Error('No connection established to disconnect from');
    }

    const conn = await this.connection;
    return conn.close();
  }

  /**
   * Create a channel
   *
   * @private
   * @returns {Promise<void>}
   * @memberof AmqpClient
   */
  private async createChannel(): Promise<void> {
    const connection = await this.connection;
    const channel = await connection.createConfirmChannel();
    this.channel.resolve(channel);
  }

  /**
   * Create a connection
   *
   * @private
   * @param {string} uri
   * @memberof AmqpClient
   */
  private createConnection(uri: string): void {
    const operation = retry.operation();

    operation.attempt(async (attempt) => {
      try {
        const connection = await amqp.connect(uri);
        connection.once('close', (err) => {
          this.emit('disconnected', err);
        });

        connection.on('error', (err) => {
          this.emit('error', err);
          this.emit('disconnected', err);
        });

        process.on('SIGINT', () => {
          connection.close().then(() => {
            this.emit('disconnected');
            process.exit(0);
          });
        });

        this.emit('connected');
        this.connection.resolve(connection);
      } catch(e) {
        if(operation.retry(e)) return;
        this.emit('error', e);
        this.connection.reject(e);
      }
    });
  }

}
