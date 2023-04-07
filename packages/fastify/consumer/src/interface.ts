import type { Channel, ISubscribeParams } from '@rabbitmq-ts/core';

export type TSubscribeFunc = (
  subscribeOptions: ISubscribeParams,
  impl: (data: unknown, channel: Channel) => void,
) => Promise<void>;
