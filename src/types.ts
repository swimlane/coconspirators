import { Message } from 'amqplib';
import { AmqpClient } from '.';

export const NAME_KEY = 'name';

export interface QueueOptions {
  name?: string;
  exchange?: string;
  contentType?: string;
  durable?: boolean;
  prefetch?: number;
  rpc?: boolean;
  noAck?: boolean;
  exclusive?: boolean;
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
  reply?: (content: any, replyOptions: ReplyOptions) => any;
  ack?: () => void;
  body: T;
}
