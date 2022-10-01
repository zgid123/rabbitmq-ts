import { Connection } from '@rabbitmq-ts/core';
import { DynamicModule, Module } from '@nestjs/common';

import type { ChannelWrapper, TAssertExchange } from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';
import { RabbitMQModel } from './RabbitMQModel';

type TExchangeBaseType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

type TExchangeType = TExchangeBaseType | Omit<string, TExchangeBaseType>;

interface IBaseRegisterParams {
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
export class RabbitMQModule {
  static register({
    host,
    port,
    username,
    password,
    virtualHost,
    configurations,
  }: IRegisterWithAtomParams): DynamicModule;
  static register({
    uri,
    configurations,
  }: IRegisterWithUriParams): DynamicModule;
  static register({
    uri,
    host,
    port,
    username,
    password,
    virtualHost,
    configurations = {},
  }: IRegisterWithAtomParams & IRegisterWithUriParams): DynamicModule {
    const { exchanges = [] } = configurations;

    return {
      module: RabbitMQModule,
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
            } as IRegisterWithAtomParams);

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
