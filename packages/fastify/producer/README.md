Fastify's Plugin for RabbitMQ Producer.

# Install

```sh
npm install --save @rabbitmq-ts/fastify-producer

# or

yarn add @rabbitmq-ts/fastify-producer

# or

pnpm add @rabbitmq-ts/fastify-producer
```

# Usage

```ts
import { config } from 'dotenv';
import detect from 'detect-port';
import RabbitMQProducer from '@rabbitmq-ts/fastify-producer';

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

  return fastify;
}

bootstrap();
```
