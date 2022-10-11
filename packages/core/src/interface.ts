import type { AmqpConnectionManagerOptions } from 'amqp-connection-manager';

export interface IConnectionStringAtomProps
  extends AmqpConnectionManagerOptions {
  host: string;
  username: string;
  password: string;
  virtualHost: string;
  port: number | string;
}

export interface IConnectionStringProps extends AmqpConnectionManagerOptions {
  uri: string;
}
