import { Controller } from '@nestjs/common';
import {
  Ctx,
  Payload,
  Subcribe,
  type RmqContext,
} from '@rabbitmq-ts/nestjs-consumer';

import { EXCHANGE, QUEUE, ROUTE } from '../constants';

interface IPayloadProps {
  text: string;
}

@Controller()
export class ConsumerController {
  @Subcribe({
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
  public async handleSubcribe(
    @Payload() data: IPayloadProps,
    @Ctx() context: RmqContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context', context);

    return 'Ok!';
  }
}
