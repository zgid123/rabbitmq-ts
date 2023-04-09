import { assignMetadata } from '@nestjs/common';

import type { ISubscribeParams } from '@rabbitmq-ts/core';

const PAYLOAD_TYPE = 3;
const CONTEXT_TYPE = 6;
const ROUTE_ARGS_METADATA = '__routeArguments__';
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

function createDecorator(type: number): () => ParameterDecorator {
  return (): ParameterDecorator => {
    return (target, key = '', index) => {
      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata(
          Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) ||
            {},
          type,
          index,
        ),
        target.constructor,
        key,
      );
    };
  };
}

export const Ctx = createDecorator(CONTEXT_TYPE);

export const Payload = createDecorator(PAYLOAD_TYPE);
