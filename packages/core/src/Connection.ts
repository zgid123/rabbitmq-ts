import {
  connect,
  type ChannelWrapper,
  type CreateChannelOpts,
  type AmqpConnectionManager,
} from 'amqp-connection-manager';

import { combine } from './utils';

import type { IConnectionAtomProps, IConnectionProps } from './interface';

export class Connection {
  #urls: string[] = [];
  #amqpConnectionManager: AmqpConnectionManager;

  constructor({ urls, ...options }: IConnectionProps) {
    if (!Array.isArray(urls)) {
      urls = [urls];
    }

    this.#urls = urls.map(this.#convertUrl);
    this.#amqpConnectionManager = connect(this.#urls, options);
  }

  public get connection(): AmqpConnectionManager {
    return this.#amqpConnectionManager;
  }

  public get urls(): string[] {
    return this.#urls;
  }

  public createChannel({
    json = true,
    ...rest
  }: CreateChannelOpts = {}): ChannelWrapper {
    return this.#amqpConnectionManager.createChannel({
      json,
      ...rest,
    });
  }

  public close(): Promise<void> {
    return this.#amqpConnectionManager.close();
  }

  #convertUrl(url: string | IConnectionAtomProps): string {
    if (typeof url === 'string') {
      return url;
    }

    const { host, port, username, password, virtualHost } = url;

    return combine(
      { joinWith: '/' },
      combine(
        { joinWith: '@' },
        combine(
          { joinWith: '' },
          'amqp://',
          combine({ joinWith: ':' }, username, password),
        ),
        combine({ joinWith: ':' }, host, port.toString()),
      ),
      virtualHost,
    );
  }
}
