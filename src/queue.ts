import * as amqp from 'amqplib';
import * as shortid from 'shortid';

export class Queue {

  options: any;
  q: any;
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
    return this.q = chnl.assertQueue(this.name, this.options);
  }

  async publish(message: any, options: any = {}): Promise<any> {
    const chnl = await this.channel;
    const correlationId = shortid.generate();

    // transpose options
    options = Object.assign({
      persistent: false,
      noAck: true,
      correlationId
    }, options);

    // setup reply names
    if(this.options.reply) {
      options.replyTo = `${this.name}_reply`;
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

  async subscribe(name: string, fn: Function, options: any = {}): Promise<any> {
    const chnl = await this.channel;

    // transpose options
    options = Object.assign({ 
      noAck: this.options.noAck 
    }, options);

    // consume the message
    return chnl.consume(this.name, async (msg: amqp.Message) => {
      // invoke the subscribe middlewares
      let response = msg.content;
      if(this.middlewares) {
        for(const mw of this.middlewares) {
          if(mw.subscribe) response = await mw.subscribe(response);
        }
      }

      // invoke the callback
      let reply = await fn(response);

      // if replyTo and result passed, call em back
      if(!!msg.properties.replyTo && reply) {
        const { replyTo, correlationId } = msg.properties.correlationId;
        
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
