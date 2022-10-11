import type { Options, Replies } from 'amqplib';
import type { Options as ManagerOptions } from 'amqp-connection-manager';

export type TAssertExchange = Options.AssertExchange;

export type TRepliesAssertExchange = Replies.AssertExchange;

export type TRepliesEmpty = Replies.Empty;

export type TPublish = ManagerOptions.Publish;

export type TConsumeOptions = ManagerOptions.Consume;

export type { ConsumeMessage } from 'amqplib';

export type {
  ChannelWrapper,
  AmqpConnectionManagerOptions,
} from 'amqp-connection-manager';

export * from './Connection';

export type {
  IConnectionStringProps,
  IConnectionStringAtomProps,
} from './interface';
