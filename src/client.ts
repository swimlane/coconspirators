import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import * as retry from 'retry';
import { Deferred } from './deferred';

export class AmqpClient extends EventEmitter {

  connection: Promise<amqp.Connection>;
  channel: Promise<amqp.ConfirmChannel>;
  uri: string;

  private deferredConnection: Deferred<amqp.Connection>;
  private deferredChannel: Deferred<amqp.ConfirmChannel>;

  /**
   * Creates an instance of AmqpClient.
   *
   * @memberof AmqpClient
   */
  constructor() {
    super();
    this.deferredConnection = new Deferred<amqp.Connection>();
    this.connection = this.deferredConnection.promise;

    this.deferredChannel = new Deferred<amqp.ConfirmChannel>();
    this.channel = this.deferredChannel.promise;
  }

  /**
   * Connect to the queue
   *
   * @param {string} [uri='amqp://localhost:5672'] uri to amqp server
   * @param {amqp.Connection|Promise<amqp.Connection>} conn an already established connection or Promise to one
   * @returns {Promise<amqp.Connection>}
   * @memberof AmqpClient
   */
  connect(
    uri: string = 'amqp://localhost:5672',
    conn?: amqp.Connection|Promise<amqp.Connection>
  ): Promise<amqp.Connection> {
    this.uri = uri;
    if (conn === undefined) {
      this.deferredConnection.resolve(this.createConnection(this.uri));
    } else {
      this.deferredConnection.resolve(conn);
    }

    this.setupListeners();

    this.deferredChannel.resolve(this.createChannel());

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
    const conn = await this.connection;
    return conn.close();
  }

  /**
   * Create a channel
   *
   * @private
   * @returns {Promise<amqp.ConfirmChannel>}
   * @memberof AmqpClient
   */
  private async createChannel(): Promise<amqp.ConfirmChannel> {
    return new Promise<amqp.ConfirmChannel>(async (resolve, reject) => {
      const connection = await this.connection;
      try {
        const channel = await connection.createConfirmChannel();
        resolve(channel);
      } catch (err) {
        this.emit(err);
        reject(err);
      }
    });
  }

  /**
   * Create a connection
   *
   * @private
   * @param {string} uri
   * @returns {Promise<amqp.Connection>}
   * @memberof AmqpClient
   */
  private createConnection(uri: string): Promise<amqp.Connection> {
    return new Promise<amqp.Connection>((resolve, reject) => {
      const operation = retry.operation();

      operation.attempt(async (attempt) => {
        try {
          const connection = await amqp.connect(uri);
          this.emit('connected');

          resolve(connection);
        } catch(e) {
          if(operation.retry(e)) return;
          this.emit('error', e);
          reject(e);
        }
      });
    });
  }

  /**
   * Setup listeners to connection events
   *
   * @private
   * @returns {Promise<void>}
   * @memberof AmqpClient
   */
  private async setupListeners(): Promise<void> {
    const connection = await this.connection;
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
      }, (err) => {
        this.emit('error', err);
        this.emit('disconnected', err);
        process.exit(1);
      });
    });
  }
}
