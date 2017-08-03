/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class AmqpClient extends EventEmitter {
    connection: any;
    channel: any;
    uri: string;
    constructor();
    connect(uri?: string): Promise<any>;
    reconnect(): Promise<any>;
    disconnect(): Promise<any>;
    private createChannel();
    private createConnection(uri);
}
