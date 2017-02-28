# coconspirators
coconspirators is a microservice framework for RabbitMQ written in TypeScript. Under the hood it uses 
[qmqp.node](https://github.com/squaremo/amqp.node), the battle-tested AMQP client, under the hood to communicate 
with RabbitMQ and has best-practices baked in.

## Install
`npm i coconspirators --S`

### Usage
```
import { Rabbit } from 'coconspirators';

const client = new Rabbit({ 
  url: 'amqp://rabbitmq:5672',
  logger: console,
  connectImmediately: true
});

client.subscribe('foo', (res) => console.log(res));
client.publish('foo', { foo: true });
```
