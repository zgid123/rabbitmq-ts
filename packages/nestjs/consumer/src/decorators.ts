import type {
  TAssertQueue,
  TAssertExchange,
  TConsumeOptions,
} from '@rabbitmq-ts/core';

const PATTERN_METADATA = 'microservices:pattern';
const PATTERN_HANDLER_METADATA = 'microservices:handler_type';

type TExchangeBaseType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match';

type TExchangeType = TExchangeBaseType | Omit<string, TExchangeBaseType>;

interface IExchangeProps extends Partial<TAssertExchange> {
  name: string;
  type?: TExchangeType;
}

interface IQueueProps extends Partial<TAssertQueue> {
  name: string;
}

export interface ISubcribeParams {
  queue: IQueueProps;
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
