/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class AmqpClient extends EventEmitter {
    connection: any;
    channel: any;
    uri: string;
    connect(uri?: string): Promise<void>;
    reconnect(): Promise<any>;
    disconnect(): Promise<any>;
    private createConnection(uri);
}
