import { Module } from '@nestjs/common';
import { RabbitMQProducer } from '@rabbitmq-ts/nestjs-producer';

import { EXCHANGE } from '../constants';
import { ProducerController } from './producer.controller';

@Module({
  imports: [
    RabbitMQProducer.register({
      host: process.env.RABBITMQ_HOST,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
      configurations: {
        exchanges: [
          {
            exchange: EXCHANGE,
            type: 'topic',
            options: {
              durable: false,
            },
          },
        ],
      },
    }),
  ],
  controllers: [ProducerController],
})
export class ProducerModule {}
