NestJS's Dynamic Module for Producer.

# Usage

```ts
// test.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@rabbitmq-ts/nestjs-producer';
import { TestController } from './test.controller.ts';

@Module({
  imports: [
    RabbitMQModule.register({
      host: process.env.RABBITMQ_HOST,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
      configurations: {
        exchanges: [
          {
            exchange: 'exchange_name',
            type: 'topic',
            options: {
              durable: false,
            },
          },
        ],
      },
    }),
  ],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
```

```ts
// test.controller.ts
import { Get, Controller } from '@nestjs/common';
import { RabbitMQModel } from '@rabbitmq-ts/nestjs-client';

@Controller()
export class TestController {
  constructor(private readonly rabbitMQModel: RabbitMQModel) {}

  @Get('/')
  public async get(): Promise<string> {
    this.rabbitMQModel.publish('exchange_name', 'routingKey', {
      message: 'test message',
    });

    return 'ok';
  }
}
```
