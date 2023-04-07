import { config } from 'dotenv';
import detect from 'detect-port';
import RabbitMQProducer from '@rabbitmq-ts/fastify-producer';
import RabbitMQConsumer from '@rabbitmq-ts/fastify-consumer';

config({
  path: '.env',
});

import { fastify } from 'config/fastify';

import { EXCHANGE, QUEUE, ROUTE } from './constants';

async function bootstrap(): Promise<typeof fastify> {
  fastify.register(RabbitMQProducer, {
    urls: {
      host: process.env.RABBITMQ_HOST,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
    },
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
  });

  fastify.register(RabbitMQConsumer, {
    urls: [
      {
        host: process.env.RABBITMQ_HOST,
        port: process.env.RABBITMQ_PORT,
        username: process.env.RABBITMQ_USERNAME,
        password: process.env.RABBITMQ_PASSWORD,
        virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
      },
    ],
  });

  fastify.get('/', (_request, reply) => {
    fastify.rabbitMQProducer.publish(EXCHANGE, ROUTE, {
      text: 'hello from producer',
    });

    reply.send('Ok');
  });

  const port = await detect(3_000);
  await fastify.listen({
    port,
  });

  fastify.rabbitMQConsumer.subscribe(
    {
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
    },
    (data) => {
      console.log(data);
    },
  );

  return fastify;
}

bootstrap();
