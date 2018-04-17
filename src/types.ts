import { Message } from 'amqplib';

export const NAME_KEY = 'name';

export interface QueueOptions {
  name?: string;
  exchange?: string;
  contentType?: string;
  durable?: boolean;
  rpc?: boolean;
  noAck?: boolean;
  exclusive?: boolean;
  channel?: ChannelOptions;
}

export interface ChannelOptions {
  prefetch?: number;
}

export interface ExchangeOptions {
  name: string;
  type: ExchangeType;
  contentType?: string;
  durable?: boolean;
  autoDelete?: boolean;
  internal?: boolean;
  alternateExchange?: string;
  arguments?: any;
  channel?: ChannelOptions;
}

export enum ExchangeType {
  direct = 'direct',
  fanout = 'fanout',
  headers = 'headers',
  topic = 'topic'
}

export interface SubscribeOptions {
  contentType?: string;
  durable?: boolean;
  prefetch?: number;
  reply?: boolean;
  noAck?: boolean;
}

export interface PublishOptions {
  routingKey?: string;
  exchangeOverride?: string;
  expiration?: string;
  userId?: string;
  CC?: string | string[];
  priority?: number;
  persistent?: boolean;
  deliveryMode?: 1 | 2;
  mandatory?: boolean;
  BCC?: string | string[];
}

export interface ReplyOptions {
  replyTo: string;
  correlationId?: string;
}

export interface ReplyableMessage<T = Buffer> extends Message {
  reply?: (content: any) => Promise<{ content: any, properties: ReplyOptions}>;
  ack?: () => void;
  body: T;
}
