import { config } from 'dotenv';
import detect from 'detect-port';
import { NestFactory } from '@nestjs/core';
import { RabbitMQConsumer } from '@rabbitmq-ts/nestjs-consumer';

config({
  path: '.env',
});

import { AppModule } from './app.module';

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

  const port = await detect(3_000);
  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Run on ${port}`);
}

bootstrap();
