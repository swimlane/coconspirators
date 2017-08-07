/// <reference types="node" />
import 'reflect-metadata';
import { EventEmitter } from 'events';
import { AmqpClient } from './client';
import { QueueOptions, PublishOptions, SubscribeOptions, ReplyOptions } from './types';
import * as amqp from 'amqplib';
export declare class AmqpQueue<T> extends EventEmitter {
    private client;
    queue: any;
    rpcQueue: any;
    options: QueueOptions;
    constructor(client: AmqpClient, options?: QueueOptions);
    subscribe(callback: (message: T) => {}, options?: SubscribeOptions): Promise<any>;
    publish(content: any, options?: PublishOptions): Promise<any>;
    replyOf(idOrMessage: string | any): Promise<any>;
    reply(content: any, options?: ReplyOptions): Promise<any>;
    ack(message: amqp.Message): Promise<void>;
    purge(): Promise<any>;
    private createQueue();
    private consumeReplies();
}
