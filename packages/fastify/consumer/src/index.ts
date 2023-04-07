import fp from 'fastify-plugin';
import {
  Connection,
  type Channel,
  type TRepliesEmpty,
  type ConsumeMessage,
  type IConnectionProps,
  type TRepliesAssertExchange,
} from '@rabbitmq-ts/core';

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

import type { TSubscribeFunc } from './interface';

function handleMessage(message: ConsumeMessage | null): unknown {
  if (!message) {
    return message;
  }

  const { content } = message;
  let rawMessage = content.toString();

  try {
    rawMessage = JSON.parse(rawMessage);
  } catch {
    // do nothing
  }

  return rawMessage;
}

const rabbitMQConsumer: FastifyPluginAsync<IConnectionProps> = async (
  fastify: FastifyInstance,
  props: IConnectionProps,
) => {
  let channel: Channel;
  const connection = new Connection(props);
  const channelWrapper = connection.createChannel({
    json: false,
    setup: (chl: Channel) => {
      channel = chl;
    },
  });

  await channelWrapper.waitForConnect();

  const subscribe: TSubscribeFunc = async (opts, impl) => {
    const { queue, exchange, routingKey, consumerOptions } = opts;
    const { name: queueName, ...queueOptions } = queue;
    const {
      name: exchangeName,
      type: exchangeType = 'direct',
      ...exchangeOptions
    } = exchange || {};

    await channel.assertQueue(queueName, queueOptions);

    const prepareComsumers: Promise<
      TRepliesAssertExchange | TRepliesEmpty | void
    >[] = [];

    if (exchangeName) {
      prepareComsumers.push(
        channel.assertExchange(
          exchangeName,
          exchangeType as string,
          exchangeOptions,
        ),
      );
    }

    if (routingKey) {
      prepareComsumers.push(
        channel.bindQueue(queueName, exchangeName || '', routingKey),
      );
    }

    Promise.all([
      ...prepareComsumers,
      channel.consume(
        queueName,
        (message) => {
          const data = handleMessage(message);

          return impl(data, channel);
        },
        consumerOptions,
      ),
    ]);
  };

  fastify.decorate('rabbitMQConsumer', {
    subscribe,
  });

  fastify.addHook('onClose', onClose);

  function onClose() {
    connection.close();
  }
};

export default fp(rabbitMQConsumer, {
  fastify: '>=3',
  name: '@@rabbitmq-ts/fastify-consumer',
});
