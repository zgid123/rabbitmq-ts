import { Connection } from '@rabbitmq-ts/core';
import { DynamicModule, Module } from '@nestjs/common';

import type { IConnectionStringProps } from '@rabbitmq-ts/core';
import type {
  ChannelWrapper,
  TAssertExchange,
  AmqpConnectionManagerOptions,
} from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';
import { RabbitMQModel } from './RabbitMQModel';

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
export class RabbitMQProducer {
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

            return channel;
          },
        },
        RabbitMQModel,
      ],
      exports: [RabbitMQModel],
    };
  }
}
