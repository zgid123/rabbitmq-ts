import type { Channel } from '@rabbitmq-ts/core';

interface IRabbitMQContextProps {
  pattern: string;
  channel: Channel;
  message: Record<string, any>;
}

export class RmqContext {
  #context: IRabbitMQContextProps;

  constructor(context: IRabbitMQContextProps) {
    this.#context = context;
  }

  public getMessage<T extends Record<string, any> = Record<string, any>>(): T {
    return this.#context.message as T;
  }

  public getChannel(): Channel {
    return this.#context.channel;
  }

  public getPattern(): string {
    return this.#context.pattern;
  }
}
