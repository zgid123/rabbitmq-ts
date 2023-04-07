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
  type IProducerProps,
} from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';
import { RabbitMQModel } from './RabbitMQModel';

import type { IChannelProps } from './RabbitMQModel';

@Module({})
export class RabbitMQProducer implements OnApplicationShutdown {
  public static register({
    urls,
    configurations = {},
    connectionOptions = {},
  }: IProducerProps): DynamicModule {
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
