import { Controller } from '@nestjs/common';
import {
  Ctx,
  Payload,
  Subscribe,
  type RmqContext,
} from '@rabbitmq-ts/nestjs-consumer';

import { EXCHANGE, QUEUE, ROUTE } from '../constants';

interface IPayloadProps {
  text: string;
}

@Controller()
export class ConsumerController {
  @Subscribe({
    routingKey: ROUTE,
    queue: {
      exclusive: true,
      autoDelete: true,
      name: QUEUE,
    },
    exchange: {
      type: 'topic',
      durable: false,
      name: EXCHANGE,
    },
    consumerOptions: {
      noAck: true,
    },
  })
  public async handleSubscribe(
    @Payload() data: IPayloadProps,
    @Ctx() context: RmqContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.getChannel()', context.getChannel());
    console.log('context.getMessage()', context.getMessage());
    console.log('context.getPattern()', context.getPattern());

    return 'Ok!';
  }
}
