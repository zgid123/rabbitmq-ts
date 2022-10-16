import { Inject, Injectable } from '@nestjs/common';

import type { TPublish, ChannelWrapper, Connection } from '@rabbitmq-ts/core';

import { CHANNEL_WRAPPER } from './constants';

export interface IChannelProps extends ChannelWrapper {
  connection: Connection;
}

@Injectable()
export class RabbitMQModel {
  #channel: IChannelProps;

  constructor(@Inject(CHANNEL_WRAPPER) channelWrapper: IChannelProps) {
    this.#channel = channelWrapper;
  }

  public publish(
    exchange: string,
    routingKey: string,
    content: Buffer | string | unknown,
    options: TPublish = {},
  ): Promise<boolean> {
    return this.#channel.publish(exchange, routingKey, content, options);
  }

  public async close(): Promise<void> {
    // for some reasons, channel at this moment already closed
    // no need to close channel
    // close connection for jest test or other usages
    // for jest test, without this one, it will keep the process and need close it manually
    await this.#channel.connection.close();
  }
}
