import { Connection } from '@rabbitmq-ts/core';
import { Server, RmqContext } from '@nestjs/microservices';

import type {
  MessageHandler,
  CustomTransportStrategy,
} from '@nestjs/microservices';
import type {
  Channel,
  TRepliesEmpty,
  ChannelWrapper,
  ConsumeMessage,
  TRepliesAssertExchange,
  IConnectionStringProps,
  IConnectionStringAtomProps,
} from '@rabbitmq-ts/core';

import { omit } from './utils';

import type { ISubcribeParams } from './decorators';

type TCallback = () => void;

interface ICreateServiceReturnProps {
  strategy: RabbitMQConsumer;
}

export class RabbitMQConsumer
  extends Server
  implements CustomTransportStrategy
{
  #connection: Connection;
  #patterns: ISubcribeParams[] = [];
  #channel: ChannelWrapper | undefined;

  constructor({
    host,
    port,
    username,
    password,
    virtualHost,
    ...connectionOptions
  }: IConnectionStringAtomProps);
  constructor({ uri, ...connectionOptions }: IConnectionStringProps);
  constructor({
    uri,
    host,
    port,
    username,
    password,
    virtualHost,
    ...connectionOptions
  }: IConnectionStringProps & IConnectionStringAtomProps) {
    super();

    let options: IConnectionStringProps | IConnectionStringAtomProps = {
      uri,
    };

    if (!uri) {
      options = {
        host,
        port,
        username,
        password,
        virtualHost,
      };
    }

    this.#connection = new Connection({
      ...options,
      ...connectionOptions,
    } as IConnectionStringAtomProps);
  }

  public static createService({
    host,
    port,
    username,
    password,
    virtualHost,
    ...connectionOptions
  }: IConnectionStringAtomProps): ICreateServiceReturnProps;
  public static createService({
    uri,
    ...connectionOptions
  }: IConnectionStringProps): ICreateServiceReturnProps;
  public static createService(
    params: IConnectionStringProps & IConnectionStringAtomProps,
  ): ICreateServiceReturnProps {
    return {
      strategy: new RabbitMQConsumer(params as IConnectionStringAtomProps),
    };
  }

  public addHandler(
    pattern: ISubcribeParams & { isRabbitMQ: boolean },
    callback: MessageHandler,
    isEventHandler = false,
    extras: Record<string, any> = {},
  ) {
    if (typeof pattern === 'object' && pattern.isRabbitMQ) {
      pattern = omit(pattern, ['isRabbitMQ']) as ISubcribeParams & {
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
    pattern: ISubcribeParams,
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
