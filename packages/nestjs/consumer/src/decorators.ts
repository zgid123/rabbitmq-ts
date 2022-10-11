import type { TConsumeOptions } from '@rabbitmq-ts/core';

const PATTERN_METADATA = 'microservices:pattern';
const PATTERN_HANDLER_METADATA = 'microservices:handler_type';

type TExchangeBaseType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

type TExchangeType = TExchangeBaseType | Omit<string, TExchangeBaseType>;

interface IExchangeProps {
  name: string;
  type?: TExchangeType;
}

export interface ISubcribeParams {
  queue: string;
  routingKey?: string;
  exchange?: IExchangeProps;
  consumerOptions?: TConsumeOptions;
}

export function Subcribe({
  queue,
  exchange,
  routingKey,
  consumerOptions = {},
}: ISubcribeParams): MethodDecorator {
  return (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(
      PATTERN_METADATA,
      [
        {
          queue,
          exchange,
          routingKey,
          consumerOptions,
          isRabbitMQ: true,
        },
      ],
      descriptor.value,
    );
    Reflect.defineMetadata(PATTERN_HANDLER_METADATA, 1, descriptor.value);

    return descriptor;
  };
}
