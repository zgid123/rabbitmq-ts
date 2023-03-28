import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { ConsumerModule } from './consumer/consumer.module';
import { ProducerModule } from './producer/producer.module';

@Module({
  imports: [ConsumerModule, ProducerModule],
  controllers: [AppController],
})
export class AppModule {}
