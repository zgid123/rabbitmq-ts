import { Connection } from '@rabbitmq-ts/core';
import { Server, RmqContext } from '@nestjs/microservices';

import type {
  MessageHandler,
  CustomTransportStrategy,
} from '@nestjs/microservices';
import type {
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
  #channel: ChannelWrapper;

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

    this.#channel = this.#connection.createChannel({
      json: false,
    });
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
      const { exchange, consumerOptions, queue, routingKey } = pattern;
      const { name: exchangeName, type: exchangeType = 'direct' } =
        exchange || {};

      const prepareComsumers: Promise<
        TRepliesAssertExchange | TRepliesEmpty | void
      >[] = [];

      if (exchangeName) {
        prepareComsumers.push(
          this.#channel.assertExchange(exchangeName, exchangeType as string),
        );
      }

      if (routingKey) {
        prepareComsumers.push(
          this.#channel.bindQueue(queue, exchangeName || '', routingKey),
        );
      }

      Promise.all([
        this.#channel.assertQueue(queue),
        ...prepareComsumers,
        this.#channel.consume(
          queue,
          (message) => {
            return this.#handleMessage(message, this.#channel, pattern);
          },
          consumerOptions,
        ),
      ]);
    }

    super.addHandler(pattern, callback, isEventHandler, extras);
  }

  async #handleMessage(
    message: ConsumeMessage,
    channel: ChannelWrapper,
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

  public listen(callback: TCallback) {
    callback();
  }

  public close() {
    this.#channel.close();
    this.#connection.close();
  }
}
