import { Controller, Get } from '@nestjs/common';
import { RabbitMQModel } from '@rabbitmq-ts/nestjs-producer';

import { ROUTE, EXCHANGE } from '../constants';

@Controller('/producer')
export class ProducerController {
  constructor(private readonly rabbitMQModel: RabbitMQModel) {}

  @Get()
  public async publish(): Promise<string> {
    this.rabbitMQModel
      .publish(EXCHANGE, ROUTE, {
        text: 'hello from producer',
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });

    return 'Ok!';
  }
}
