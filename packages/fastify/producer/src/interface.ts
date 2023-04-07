import type { TPublish } from '@rabbitmq-ts/core';

export type TPublishFunc = (
  exchange: string,
  routingKey: string,
  content: Buffer | string | unknown,
  options?: TPublish,
) => Promise<boolean>;
