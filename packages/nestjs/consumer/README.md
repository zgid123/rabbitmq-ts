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
import { RabbitMQService } from '@rabbitmq-ts/nestjs-consumer';
import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new RabbitMQService({
        host: process.env.RABBITMQ_HOST,
        port: process.env.RABBITMQ_PORT,
        username: process.env.RABBITMQ_USERNAME,
        password: process.env.RABBITMQ_PASSWORD,
        virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
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
import { RabbitMQService } from '@rabbitmq-ts/nestjs-consumer';
import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    RabbitMQService.createService({
      host: process.env.RABBITMQ_HOST,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
    }),
  );

  await app.listen(3_000);
}

bootstrap();
```

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { RabbitMQService } from '@rabbitmq-ts/nestjs-consumer';
import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(
    RabbitMQService.createService({
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
import { Ctx, Payload, Subcribe } from '@rabbitmq-ts/nestjs-consumer';

import type { RmqContext } from '@rabbitmq-ts/nestjs-consumer';

@Controller()
export class TestController {
  @Subcribe({
    queue: 'queue_name',
    routingKey: 'routing_key',
    exchange: {
      name: 'exchange_name',
      type: 'topic',
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
