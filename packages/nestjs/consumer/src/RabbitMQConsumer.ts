import { Logger } from '@nestjs/common';
import {
  Connection,
  parseMessage,
  type Channel,
  type TRepliesEmpty,
  type ChannelWrapper,
  type ConsumeMessage,
  type IConnectionProps,
  type ISubscribeParams,
  type TRepliesAssertExchange,
} from '@rabbitmq-ts/core';

import { RmqContext } from './Context';
import { normalizePattern, omit } from './utils';

type TCallback = () => void;

interface ICreateServiceReturnProps {
  strategy: RabbitMQConsumer;
}

interface IMessageHandlerProps<TData = unknown, TResult = unknown> {
  (data: TData, ctx?: RmqContext): Promise<TResult>;
}

export class RabbitMQConsumer {
  #connection: Connection;
  #patterns: ISubscribeParams[] = [];
  #channel: ChannelWrapper | undefined;
  #logger = new Logger('RabbitMQConsumer');
  #messageHandlers = new Map<string, IMessageHandlerProps>();

  constructor(props: IConnectionProps) {
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
    callback: IMessageHandlerProps,
    _isEventHandler = false,
    _extras: Record<string, any> = {},
  ) {
    if (typeof pattern === 'object' && pattern.isRabbitMQ) {
      pattern = omit(pattern, ['isRabbitMQ']) as ISubscribeParams & {
        isRabbitMQ: boolean;
      };

      this.#patterns.push(pattern);
    }

    const normalizedPattern = normalizePattern(pattern);
    this.#messageHandlers.set(normalizedPattern, callback);
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
                return handleMessage(message, channel, pattern);
              },
              consumerOptions,
            ),
          ]);
        });
      },
    });

    callback();
  }

  public async close() {
    await this.#channel?.close();
    await this.#connection.close();
  }

  async #handleMessage(
    message: ConsumeMessage | null,
    channel: Channel,
    pattern: ISubscribeParams,
  ): Promise<unknown> {
    if (message === null) {
      return;
    }

    const rawMessage = parseMessage(message);
    const patternAsString = normalizePattern(pattern);
    const rmqContext = new RmqContext({
      message,
      channel,
      pattern: patternAsString,
    });
    const handler = this.#messageHandlers.get(patternAsString);

    if (!handler) {
      return this.#logger.error(
        `There is no matching event handler defined in the consumer. Event pattern: ${patternAsString}`,
      );
    }

    return handler(rawMessage, rmqContext);
  }
}
