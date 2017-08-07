import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import * as retry from 'retry';
import { defer } from './util';

export class AmqpClient extends EventEmitter {

  connection: any;
  channel: any;
  uri: string;

  constructor() {
    super();
    this.connection = defer();
    this.channel = defer();
  }

  connect(uri: string = 'amqp://localhost:5672'): Promise<any> {
    this.uri = uri;

    this.createConnection(this.uri);
    this.createChannel();

    return this.connection;
  }

  async reconnect(): Promise<any> {
    await this.disconnect();
    return this.connect(this.uri);
  }

  async disconnect(): Promise<any> {
    if(!this.connection) {
      throw new Error('No connection established to disconnect from');
    }

    const conn = await this.connection;
    return conn.close();
  }

  private async createChannel(): Promise<void> {
    const connection = await this.connection;
    const channel = await connection.createConfirmChannel();
    this.channel.resolve(channel);
  }

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
