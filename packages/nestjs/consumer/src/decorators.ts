import type { ISubscribeParams } from '@rabbitmq-ts/core';

const PATTERN_METADATA = 'microservices:pattern';
const PATTERN_HANDLER_METADATA = 'microservices:handler_type';

export function Subscribe({
  queue,
  exchange,
  routingKey,
  consumerOptions = {},
}: ISubscribeParams): MethodDecorator {
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
