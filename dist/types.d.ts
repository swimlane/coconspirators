export declare const NAME_KEY = "name";
export interface QueueOptions {
    name?: string;
    contentType?: string;
    durable?: boolean;
    prefetch?: number;
    rpc?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
}
export interface SubscribeOptions {
    contentType?: string;
    durable?: boolean;
    prefetch?: number;
    reply?: boolean;
    noAck?: boolean;
}
export interface PublishOptions {
    persistent?: boolean;
}
export interface ReplyOptions {
    replyTo?: string;
    correlationId?: string;
}
