# coconspirators
coconspirators is a microservice framework for RabbitMQ written in TypeScript. Under the hood it uses 
[qmqp.node](https://github.com/squaremo/amqp.node), the battle-tested AMQP client, to communicate
with RabbitMQ and has best-practices baked in. Features include:

- Simple API for subscribing, publishing and replying
- Middleware Support
- TypeScript First

## Install
`npm i coconspirators --S`

## Building
`npm run build`

## Usage
```javascript
import { Rabbit, json } from 'coconspirators';

const client = new Rabbit({
  // url of the rabbit server
  url: 'amqp://rabbitmq:5672',

  // supports console or custom loggers such as winston
  logger: console
});

// Global Middleware
client.use(json());

// Connect!
await client.connect();

// Explicit Invoking Queues
const queue = client.queue('foo');
queue.subscribe(({ response, message }) => console.log(response, message));
queue.publish({ foo: true });

// Implicit Invoking Queues from client instance
client.subscribe('foo', ({ response, message }) => console.log(response, message));
client.publish('foo', { foo: true });

// Queue Middleware Usage
const queue = client.queue('foo', {}, json());

// Custom Queue Middleware
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

// RPC
const queue = client.queue('foo', { reply: true });
const result = client.publish('foo', { foo: true });
const reply = await client.replyOf(result.correlationId)

// Events
client.on('connected', () => console.log('connected!'))
client.on('disconnected', () => console.log('disconnected!'))
```

## Similar
- [coworkers](https://github.com/tjmehta/coworkers)
- [rabbit-queue](https://github.com/Workable/rabbit-queue/)
- [rabbitr](https://github.com/urbanmassage/node-rabbitr)


## Credits
`coconspirators` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.
