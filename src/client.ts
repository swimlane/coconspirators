import { EventEmitter } from 'events';
import * as amqp from 'amqplib';
import * as retry from 'retry';
import { Injectable } from 'injection-js';

@Injectable()
export class AmqpClient extends EventEmitter {

  connection: any;
  channel: any;
  uri: string;

  async connect(uri: string = 'amqp://localhost:5672'): Promise<void> {
    this.uri = uri;

    this.connection = await this.createConnection(this.uri);
    this.channel = await this.connection.createConfirmChannel();
    this.emit('connected');
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

  private createConnection(uri: string): Promise<any> {
    const operation = retry.operation();

    return new Promise((resolve, reject) => {
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
            connection.close(() => {
              this.emit('disconnected');
              process.exit(0);
            });
          });

          resolve(connection);
        } catch(e) {
          if(operation.retry(e)) return;
          reject(e);
        }
      });
    });
  }

}
