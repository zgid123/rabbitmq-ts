import type { TPublishFunc } from './interface';

declare module 'fastify' {
  export interface FastifyInstance {
    rabbitMQProducer: {
      publish: TPublishFunc;
    };
  }
}
