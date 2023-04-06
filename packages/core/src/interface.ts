import type { AmqpConnectionManagerOptions } from 'amqp-connection-manager';

export interface IConnectionAtomProps {
  host: string;
  username: string;
  password: string;
  virtualHost: string;
  port: number | string;
}

export interface IConnectionProps extends AmqpConnectionManagerOptions {
  urls: string | IConnectionAtomProps | (string | IConnectionAtomProps)[];
}
