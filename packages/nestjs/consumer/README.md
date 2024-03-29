NestJS's Dynamic Module for Consumer.

# Install

```sh
npm install --save @rabbitmq-ts/nestjs-consumer

# or

yarn add @rabbitmq-ts/nestjs-consumer

# or

pnpm add @rabbitmq-ts/nestjs-consumer
```

# Usage

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { RabbitMQConsumer } from '@rabbitmq-ts/nestjs-consumer';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new RabbitMQConsumer({
        urls: {
          host: process.env.RABBITMQ_HOST,
          port: process.env.RABBITMQ_PORT,
          username: process.env.RABBITMQ_USERNAME,
          password: process.env.RABBITMQ_PASSWORD,
          virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
        },
      }),
    },
  );

  await app.listen(3_000);
}

bootstrap();
```

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { RabbitMQConsumer } from '@rabbitmq-ts/nestjs-consumer';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    RabbitMQConsumer.createService({
      urls: [
        {
          host: process.env.RABBITMQ_HOST,
          port: process.env.RABBITMQ_PORT,
          username: process.env.RABBITMQ_USERNAME,
          password: process.env.RABBITMQ_PASSWORD,
          virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
        },
      ],
    }),
  );

  await app.listen(3_000);
}

bootstrap();
```

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { RabbitMQConsumer } from '@rabbitmq-ts/nestjs-consumer';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(
    RabbitMQConsumer.createService({
      host: process.env.RABBITMQ_HOST,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(3_000);
}

bootstrap();
```

```ts
// rabbit.controller.ts
import { Controller } from '@nestjs/common';
import { Ctx, Payload, Subscribe } from '@rabbitmq-ts/nestjs-consumer';

import type { RmqContext } from '@rabbitmq-ts/nestjs-consumer';

@Controller()
export class TestController {
  @Subscribe({
    routingKey: 'routing_key',
    queue: {
      name: 'queue_name',
      exclusive: true,
      autoDelete: true,
    },
    exchange: {
      name: 'exchange_name',
      type: 'topic',
      durable: false,
    },
    consumerOptions: {
      noAck: true,
    },
  })
  handleTest(@Payload() data: number[], @Ctx() context: RmqContext) {
    console.log(`Pattern: ${context.getPattern()}`);
    console.log(data);
  }
}
```
