import { connect } from 'amqp-connection-manager';

import type {
  ChannelWrapper,
  CreateChannelOpts,
  AmqpConnectionManager,
} from 'amqp-connection-manager';

import { combine } from './utils';

import type {
  IConnectionStringProps,
  IConnectionStringAtomProps,
} from './interface';

export class Connection {
  #uri: string;
  #amqpConnectionManager: AmqpConnectionManager;

  constructor({
    host,
    port,
    username,
    password,
    virtualHost,
    ...options
  }: IConnectionStringAtomProps);
  constructor({ uri, ...options }: IConnectionStringProps);
  constructor({
    uri,
    host,
    port,
    username,
    password,
    virtualHost,
    ...options
  }: IConnectionStringProps & IConnectionStringAtomProps) {
    if (!uri) {
      uri = combine(
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

    this.#uri = uri;
    this.#amqpConnectionManager = connect([uri], options);
  }

  public get connection(): AmqpConnectionManager {
    return this.#amqpConnectionManager;
  }

  public get uri(): string {
    return this.#uri;
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
}
