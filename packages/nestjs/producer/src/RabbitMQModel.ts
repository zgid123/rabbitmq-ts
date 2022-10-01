import { Inject, Injectable } from '@nestjs/common';

import type { TPublish, ChannelWrapper } from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';

@Injectable()
export class RabbitMQModel {
  constructor(
    @Inject(CHANNEL_WRAPPER)
    private readonly channelWrapper: unknown,
  ) {}

  public publish(
    exchange: string,
    routingKey: string,
    content: Buffer | string | unknown,
    options: TPublish = {},
  ): Promise<boolean> {
    return (this.channelWrapper as ChannelWrapper).publish(
      exchange,
      routingKey,
      content,
      options,
    );
  }
}
