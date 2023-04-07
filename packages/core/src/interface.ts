import type { Options } from 'amqplib';
import type {
  Options as ManagerOptions,
  AmqpConnectionManagerOptions,
} from 'amqp-connection-manager';

export interface IConnectionAtomProps {
  host: string;
  username: string;
  password: string;
  virtualHost: string;
  port: number | string;
}

export interface IConnectionProps extends AmqpConnectionManagerOptions {
  urls: string | IConnectionAtomProps | (string | IConnectionAtomProps)[];
}

export type TAssertExchange = Options.AssertExchange;

export type TAssertQueue = Options.AssertQueue;

export type TConsumeOptions = ManagerOptions.Consume;

type TExchangeBaseType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

export type TExchangeType = TExchangeBaseType | Omit<string, TExchangeBaseType>;

interface IExchangeProps extends Partial<TAssertExchange> {
  name: string;
  type?: TExchangeType;
}

interface IQueueProps extends Partial<TAssertQueue> {
  name: string;
}

export interface ISubscribeParams {
  queue: IQueueProps;
  routingKey?: string;
  exchange?: IExchangeProps;
  consumerOptions?: TConsumeOptions;
}

export interface IProducerProps {
  urls: IConnectionProps['urls'];
  connectionOptions?: AmqpConnectionManagerOptions;
  configurations?: {
    exchanges?: {
      exchange: string;
      type: TExchangeType;
      options?: TAssertExchange;
    }[];
  };
}
