import type { Options } from 'amqplib';
import type { Options as ManagerOptions } from 'amqp-connection-manager';

export type TAssertExchange = Options.AssertExchange;

export type TPublish = ManagerOptions.Publish;

export type { ChannelWrapper } from 'amqp-connection-manager';

export * from './Connection';

export type {
  IConnectionStringProps,
  IConnectionStringAtomProps,
} from './interface';
