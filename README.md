# coconspirators
coconspirators is a microservice framework for RabbitMQ written in TypeScript. Under the hood it uses 
[qmqp.node](https://github.com/squaremo/amqp.node), the battle-tested AMQP client, to communicate
with RabbitMQ and has best-practices baked in. Features include:

- Simple API for subscribing, publish and replying
- DI Friendly
- TypeScript First

## Install
`npm i coconspirators --S`

## Building
`npm run build`

## Usage

### Using DI
```javascript
import { Queue, AmqpQueue, AmqpClient  } from 'coconspirators';
import { Injectable } from 'injection-js';

@Injectable()
export class AmqpServer {
  connection: Promise<any>;
  constructor(public client: AmqpClient, logger: Logger) {
    this.connection = this.client.connect();

    client.on('connected', () => console.log('connected!'));
    client.on('disconnected', () => console.log('disconnected!'));
  }
}

interface ZooMessage {
  animal: string;
}

@Injectable()
@Queue({
  name: 'health'
  contentType: 'application/json'
})
export class HealthQueue extends AmqpQueue<ZooMessage> {
  constructor(client: AmqpClient) { super(client); }
}

@Injectable()
export class HealthChecker {
  constructor(queue: HealthQueue) {
    this.queue.publish({ hi: true });
    this.queue.subscribe((message: ZooMessage) => {
      console.log('message', message);
    })
  }
}
```

### Without DI
```javascript
const client = new AmqpServer();
const queue = new AmqpQueue(client, {
  name: `dynamicChannelName`,
  contentType: 'application/json'
});
```

## Credits
`coconspirators` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.
