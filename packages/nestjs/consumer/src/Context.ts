import { BaseRpcContext } from '@nestjs/microservices';

import type { Channel } from '@rabbitmq-ts/core';

type TRqmContextArgs = [Record<string, any>, Channel, string];

export class RmqContext extends BaseRpcContext<TRqmContextArgs> {
  constructor(args: TRqmContextArgs) {
    super(args);
  }

  public getMessage<T extends Record<string, any> = Record<string, any>>(): T {
    return this.args[0] as T;
  }

  public getChannel(): Channel {
    return this.args[1];
  }

  public getPattern(): string {
    return this.args[2];
  }
}
