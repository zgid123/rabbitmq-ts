import type { TSubscribeFunc } from './interface';

declare module 'fastify' {
  export interface FastifyInstance {
    rabbitMQConsumer: {
      subscribe: TSubscribeFunc;
    };
  }
}
