import type { Replies } from 'amqplib';
import type { Options as ManagerOptions } from 'amqp-connection-manager';

export type TRepliesAssertExchange = Replies.AssertExchange;

export type TRepliesEmpty = Replies.Empty;

export type TPublish = ManagerOptions.Publish;

export type { Channel, ConsumeMessage } from 'amqplib';

export type {
  ChannelWrapper,
  AmqpConnectionManagerOptions,
} from 'amqp-connection-manager';

export * from './Connection';

export { parseMessage } from './utils';

export type {
  TAssertQueue,
  TExchangeType,
  IProducerProps,
  TAssertExchange,
  TConsumeOptions,
  ISubscribeParams,
  IConnectionProps,
} from './interface';
