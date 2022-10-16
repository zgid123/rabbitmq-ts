import { Connection } from '@rabbitmq-ts/core';
import { Inject, Module } from '@nestjs/common';

import type { IConnectionStringProps } from '@rabbitmq-ts/core';
import type { OnApplicationShutdown, DynamicModule } from '@nestjs/common';
import type {
  ChannelWrapper,
  TAssertExchange,
  AmqpConnectionManagerOptions,
} from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';
import { RabbitMQModel } from './RabbitMQModel';

import type { IChannelProps } from './RabbitMQModel';

type TExchangeBaseType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

type TExchangeType = TExchangeBaseType | Omit<string, TExchangeBaseType>;

interface IBaseRegisterParams {
  connectionOptions?: AmqpConnectionManagerOptions;
  configurations?: {
    exchanges?: {
      exchange: string;
      type: TExchangeType;
      options?: TAssertExchange;
    }[];
  };
}

interface IRegisterWithUriParams extends IBaseRegisterParams {
  uri: string;
}

interface IRegisterWithAtomParams extends IBaseRegisterParams {
  host: string;
  username: string;
  password: string;
  virtualHost: string;
  port: number | string;
}

@Module({})
export class RabbitMQProducer implements OnApplicationShutdown {
  public static register({
    host,
    port,
    username,
    password,
    virtualHost,
    configurations,
    connectionOptions,
  }: IRegisterWithAtomParams): DynamicModule;
  public static register({
    uri,
    configurations,
    connectionOptions,
  }: IRegisterWithUriParams): DynamicModule;
  public static register({
    uri,
    host,
    port,
    username,
    password,
    virtualHost,
    configurations = {},
    connectionOptions = {},
  }: IRegisterWithAtomParams & IRegisterWithUriParams): DynamicModule {
    const { exchanges = [] } = configurations;

    return {
      module: RabbitMQProducer,
      providers: [
        {
          provide: CHANNEL_WRAPPER,
          useFactory: async (): Promise<ChannelWrapper> => {
            const connection = new Connection({
              uri,
              host,
              port,
              username,
              password,
              virtualHost,
              ...connectionOptions,
            } as IConnectionStringProps);

            const channel = connection.createChannel();

            await Promise.all(
              exchanges.map(({ exchange, type, options }) => {
                return Promise.all([
                  channel.assertExchange(exchange, type as string, options),
                ]);
              }),
            );

            (channel as IChannelProps).connection = connection; // trick to close connection

            return channel;
          },
        },
        RabbitMQModel,
      ],
      exports: [RabbitMQModel],
    };
  }

  constructor(
    @Inject(CHANNEL_WRAPPER) private readonly channelWrapper: IChannelProps,
  ) {}

  // for jest test or other usages
  public onApplicationShutdown(_signal: string) {
    this.channelWrapper.connection.close();
  }
}
