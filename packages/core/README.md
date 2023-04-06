A wrapper of [amqp-connection-manager](https://github.com/jwalton/node-amqp-connection-manager) for Node.JS.

# Install

```sh
npm install --save @rabbitmq-ts/core

# or

yarn add @rabbitmq-ts/core

# or

pnpm add @rabbitmq-ts/core
```

# Usage

```ts
import { Connection } from '@rabbitmq-ts/core';
import type { ChannelWrapper } from '@rabbitmq-ts/core';

(async function test() {
  const connection = new Connection({
    urls: {
      host: process.env.RABBITMQ_HOST,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
      virtualHost: process.env.RABBITMQ_VIRTUAL_HOST,
    },
  });

  const channel = connection.createChannel();

  await channel.assertExchange('exchange_name', 'topic');

  await channel.publish('exchange_name', 'routing_key', {
    message: 'test message',
  });

  channel.close();
  connection.close();
})();
```
