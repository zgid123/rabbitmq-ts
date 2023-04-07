import fp from 'fastify-plugin';
import {
  Connection,
  type Channel,
  type IProducerProps,
} from '@rabbitmq-ts/core';

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

import type { TPublishFunc } from './interface';

const rabbitMQProducer: FastifyPluginAsync<IProducerProps> = async (
  fastify: FastifyInstance,
  { urls, connectionOptions = {}, configurations = {} }: IProducerProps,
) => {
  const { exchanges = [] } = configurations;

  const connection = new Connection({
    urls,
    ...connectionOptions,
  });

  const channelWrapper = connection.createChannel({
    setup: function (channel: Channel) {
      Promise.all(
        exchanges.map(({ exchange, type, options }) => {
          return Promise.all([
            channel.assertExchange(exchange, type as string, options),
          ]);
        }),
      );
    },
  });

  await channelWrapper.waitForConnect();

  const publish: TPublishFunc = async (
    exchange,
    routingKey,
    content,
    options = {},
  ) => {
    return channelWrapper.publish(exchange, routingKey, content, options);
  };

  fastify.decorate('rabbitMQProducer', {
    publish,
  });

  fastify.addHook('onClose', onClose);

  function onClose() {
    channelWrapper.close();
    connection.close();
  }
};

export default fp(rabbitMQProducer, {
  fastify: '>=3',
  name: '@@rabbitmq-ts/fastify-producer',
});
