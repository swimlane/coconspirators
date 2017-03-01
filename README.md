# coconspirators
coconspirators is a microservice framework for RabbitMQ written in TypeScript. Under the hood it uses 
[qmqp.node](https://github.com/squaremo/amqp.node), the battle-tested AMQP client, under the hood to communicate 
with RabbitMQ and has best-practices baked in. Features include:

- Simple API for subscribing, publishing and replying
- Middleware Support
- TypeScript First

### Install
`npm i coconspirators --S`

### Building
`npm run build`

### Usage
```javascript
import { Rabbit, json } from 'coconspirators';

const client = new Rabbit({
  // url of the rabbit server
  url: 'amqp://rabbitmq:5672',

  // supports conole and winston loggers
  logger: console,

  // connect on init?
  connectImmediately: true
});

// Explicit Invoking Queues
const queue = client.queue('foo');
queue.subscribe((res) => console.log(res));
queue.publish({ foo: true });

// Implicit Invoking Queues
queue.subscribe('foo', (res) => console.log(res));
queue.publish('foo', { foo: true });

// Middleware Usage
const queue = client.queue('foo', {}, json());

// Custom Middleware
function myJson() {
  return {
    subscribe: async (msg) => {
      const content = msg.content.toString();
      return JSON.parse(content);
    },
    publish: async (msg) => {
      const json = JSON.stringify(msg);
      return new Buffer(json);
    }
  }
}

const queue = client.queue('foo', {}, myJson());
```
