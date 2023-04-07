import {
  Server,
  type MessageHandler,
  type CustomTransportStrategy,
} from '@nestjs/microservices';
import {
  Connection,
  type Channel,
  type TRepliesEmpty,
  type ChannelWrapper,
  type ConsumeMessage,
  type IConnectionProps,
  type ISubscribeParams,
  type TRepliesAssertExchange,
} from '@rabbitmq-ts/core';

import { omit } from './utils';
import { RmqContext } from './Context';

type TCallback = () => void;

interface ICreateServiceReturnProps {
  strategy: RabbitMQConsumer;
}

export class RabbitMQConsumer
  extends Server
  implements CustomTransportStrategy
{
  #connection: Connection;
  #patterns: ISubscribeParams[] = [];
  #channel: ChannelWrapper | undefined;

  constructor(props: IConnectionProps) {
    super();

    this.#connection = new Connection(props);
  }

  public static createService(
    params: IConnectionProps,
  ): ICreateServiceReturnProps {
    return {
      strategy: new RabbitMQConsumer(params),
    };
  }

  public addHandler(
    pattern: ISubscribeParams & { isRabbitMQ: boolean },
    callback: MessageHandler,
    isEventHandler = false,
    extras: Record<string, any> = {},
  ) {
    if (typeof pattern === 'object' && pattern.isRabbitMQ) {
      pattern = omit(pattern, ['isRabbitMQ']) as ISubscribeParams & {
        isRabbitMQ: boolean;
      };

      this.#patterns.push(pattern);
    }

    super.addHandler(pattern, callback, isEventHandler, extras);
  }

  public listen(callback: TCallback) {
    const patterns = this.#patterns;
    const handleMessage = this.#handleMessage.bind(this);

    this.#channel = this.#connection.createChannel({
      json: false,
      setup: function (channel: Channel) {
        patterns.forEach(async (pattern) => {
          const { exchange, consumerOptions, queue, routingKey } = pattern;
          const { name: queueName, ...queueOptions } = queue;
          const {
            name: exchangeName,
            type: exchangeType = 'direct',
            ...exchangeOptions
          } = exchange || {};

          // must declare queue first
          await channel.assertQueue(queueName, queueOptions);

          const prepareComsumers: Promise<
            TRepliesAssertExchange | TRepliesEmpty | void
          >[] = [];

          if (exchangeName) {
            prepareComsumers.push(
              channel.assertExchange(
                exchangeName,
                exchangeType as string,
                exchangeOptions,
              ),
            );
          }

          if (routingKey) {
            prepareComsumers.push(
              channel.bindQueue(queueName, exchangeName || '', routingKey),
            );
          }

          Promise.all([
            ...prepareComsumers,
            channel.consume(
              queueName,
              (message) => {
                return handleMessage(
                  message as ConsumeMessage,
                  channel,
                  pattern,
                );
              },
              consumerOptions,
            ),
          ]);
        });
      },
    });

    callback();
  }

  public close() {
    this.#channel?.close();
    this.#connection.close();
  }

  async #handleMessage(
    message: ConsumeMessage,
    channel: Channel,
    pattern: ISubscribeParams,
  ): Promise<void> {
    const { content } = message;
    let rawMessage = content.toString();

    try {
      rawMessage = JSON.parse(rawMessage);
    } catch {
      // do nothing
    }

    const packet = {
      pattern,
      data: rawMessage,
    };
    const patternAsString = JSON.stringify(pattern);
    const rmqContext = new RmqContext([message, channel, patternAsString]);

    return this.handleEvent(patternAsString, packet, rmqContext);
  }
}
