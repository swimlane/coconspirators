import * as amqp from 'amqplib';
import * as shortid from 'shortid';

export class Queue {

  options: any;
  queue: any;
  middlewares: any[];

  constructor(private channel, private name, options: any = {}, ...middlewares: any[]) { 
    this.options = Object.assign({
      durable: false,
      noAck: true
    }, options);

    this.middlewares = middlewares;
  }

  async initialize(): Promise<any> {
    const chnl = await this.channel;
    this.queue = await chnl.assertQueue(this.name, this.options);
    return this.queue;
  }

  async publish(message: any, options: any = {}): Promise<any> {
    const chnl = await this.channel;
    const correlationId = shortid.generate();

    // transpose options
    options = Object.assign({
      durable: false,
      noAck: true,
      correlationId
    }, options);

    // setup reply names
    if(this.options.reply) {
      options.replyTo = `amq.rabbitmq.reply-to`;
    }

    // invoke middlewares
    if(this.middlewares) {
      for(const mw of this.middlewares) {
        if(mw.publish) message = await mw.publish(message);
      }
    }

    chnl.sendToQueue(this.name, message, options);

    return {
      correlationId
    };
  }

  async subscribe(callback: Function, options: any = {}): Promise<any> {
    const chnl = await this.channel;

    // transpose options
    options = Object.assign({ 
      noAck: this.options.noAck 
    }, options);

    // consume the message
    chnl.consume(this.name, async (message: amqp.Message) => {
      // invoke the subscribe middlewares
      let response = message.content;
      if(this.middlewares) {
        for(const mw of this.middlewares) {
          if(mw.subscribe) response = await mw.subscribe(response);
        }
      }

      // invoke the callback
      let reply = await callback({ response, message });

      // if replyTo and result passed, call em back
      if(!!message.properties.replyTo && reply) {
        const { replyTo, correlationId } = message.properties;
        
        // invoke publish middlewares
        if(this.middlewares) {
          for(const mw of this.middlewares) {
            if(mw.publish) reply = await mw.publish(reply);
          }
        }

        this.channel.sendToQueue(replyTo, reply, { correlationId });
      }
    }, options);
  }

  purge() {
    return this.channel.purgeQueue(this.name);
  }

}
