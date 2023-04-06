import {
  Inject,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import {
  Connection,
  type Channel,
  type ChannelWrapper,
  type TAssertExchange,
  type IConnectionProps,
  type AmqpConnectionManagerOptions,
} from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';
import { RabbitMQModel } from './RabbitMQModel';

import type { IChannelProps } from './RabbitMQModel';

type TExchangeBaseType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

type TExchangeType = TExchangeBaseType | Omit<string, TExchangeBaseType>;

interface IRegisterParams {
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

@Module({})
export class RabbitMQProducer implements OnApplicationShutdown {
  public static register({
    urls,
    configurations = {},
    connectionOptions = {},
  }: IRegisterParams): DynamicModule {
    const { exchanges = [] } = configurations;

    return {
      module: RabbitMQProducer,
      providers: [
        {
          provide: CHANNEL_WRAPPER,
          useFactory: async (): Promise<ChannelWrapper> => {
            const connection = new Connection({
              urls,
              ...connectionOptions,
            });

            const channel = connection.createChannel({
              setup: function (channel: Channel) {
                Promise.all(
                  exchanges.map(({ exchange, type, options }) => {
                    return Promise.all([
                      channel.assertExchange(exchange, type as string, options),
                    ]);
                  }),
                );
              },
            });

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
