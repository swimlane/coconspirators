"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const shortid = require("shortid");
class Queue {
    constructor(channel, name, options = {}, ...middlewares) {
        this.channel = channel;
        this.name = name;
        this.options = Object.assign({
            durable: false,
            noAck: true
        }, options);
        this.middlewares = middlewares;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.channel;
            this.queue = yield chnl.assertQueue(this.name, this.options);
            return this.queue;
        });
    }
    publish(message, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.channel;
            const correlationId = shortid.generate();
            // transpose options
            options = Object.assign({
                persistent: false,
                noAck: true,
                correlationId
            }, options);
            // setup reply names
            if (this.options.reply) {
                options.replyTo = `amq.rabbitmq.reply-to`;
            }
            // invoke middlewares
            if (this.middlewares) {
                for (const mw of this.middlewares) {
                    if (mw.publish)
                        message = yield mw.publish(message);
                }
            }
            chnl.sendToQueue(this.name, message, options);
            return {
                correlationId
            };
        });
    }
    subscribe(callback, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.channel;
            // transpose options
            options = Object.assign({
                noAck: this.options.noAck
            }, options);
            // consume the message
            chnl.consume(this.name, (message) => __awaiter(this, void 0, void 0, function* () {
                // invoke the subscribe middlewares
                let response = message.content;
                if (this.middlewares) {
                    for (const mw of this.middlewares) {
                        if (mw.subscribe)
                            response = yield mw.subscribe(response);
                    }
                }
                // invoke the callback
                let reply = yield callback({ response, message });
                // if replyTo and result passed, call em back
                if (!!message.properties.replyTo && reply) {
                    const { replyTo, correlationId } = message.properties;
                    // invoke publish middlewares
                    if (this.middlewares) {
                        for (const mw of this.middlewares) {
                            if (mw.publish)
                                reply = yield mw.publish(reply);
                        }
                    }
                    this.channel.sendToQueue(replyTo, reply, { correlationId });
                }
            }), options);
        });
    }
    purge() {
        return this.channel.purgeQueue(this.name);
    }
}
exports.Queue = Queue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsbUNBQW1DO0FBRW5DO0lBTUUsWUFBb0IsT0FBTyxFQUFVLElBQUksRUFBRSxVQUFlLEVBQUUsRUFBRSxHQUFHLFdBQWtCO1FBQS9ELFlBQU8sR0FBUCxPQUFPLENBQUE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFSyxVQUFVOztZQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFFSyxPQUFPLENBQUMsT0FBWSxFQUFFLFVBQWUsRUFBRTs7WUFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2hDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV6QyxvQkFBb0I7WUFDcEIsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ3RCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxhQUFhO2FBQ2QsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVaLG9CQUFvQjtZQUNwQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FB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ZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgKiBhcyBzaG9ydGlkIGZyb20gJ3Nob3J0aWQnO1xuXG5leHBvcnQgY2xhc3MgUXVldWUge1xuXG4gIG9wdGlvbnM6IGFueTtcbiAgcXVldWU6IGFueTtcbiAgbWlkZGxld2FyZXM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2hhbm5lbCwgcHJpdmF0ZSBuYW1lLCBvcHRpb25zOiBhbnkgPSB7fSwgLi4ubWlkZGxld2FyZXM6IGFueVtdKSB7IFxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgZHVyYWJsZTogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG4gICAgdGhpcy5xdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUodGhpcy5uYW1lLCB0aGlzLm9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLnF1ZXVlO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChtZXNzYWdlOiBhbnksIG9wdGlvbnM6IGFueSA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG5cbiAgICAvLyB0cmFuc3Bvc2Ugb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICAgICAgbm9BY2s6IHRydWUsXG4gICAgICBjb3JyZWxhdGlvbklkXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBzZXR1cCByZXBseSBuYW1lc1xuICAgIGlmKHRoaXMub3B0aW9ucy5yZXBseSkge1xuICAgICAgb3B0aW9ucy5yZXBseVRvID0gYGFtcS5yYWJiaXRtcS5yZXBseS10b2A7XG4gICAgfVxuXG4gICAgLy8gaW52b2tlIG1pZGRsZXdhcmVzXG4gICAgaWYodGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgaWYobXcucHVibGlzaCkgbWVzc2FnZSA9IGF3YWl0IG13LnB1Ymxpc2gobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hubC5zZW5kVG9RdWV1ZSh0aGlzLm5hbWUsIG1lc3NhZ2UsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvcnJlbGF0aW9uSWRcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKGNhbGxiYWNrOiBGdW5jdGlvbiwgb3B0aW9uczogYW55ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAvLyB0cmFuc3Bvc2Ugb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHsgXG4gICAgICBub0FjazogdGhpcy5vcHRpb25zLm5vQWNrIFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gY29uc3VtZSB0aGUgbWVzc2FnZVxuICAgIGNobmwuY29uc3VtZSh0aGlzLm5hbWUsIGFzeW5jIChtZXNzYWdlOiBhbXFwLk1lc3NhZ2UpID0+IHtcbiAgICAgIC8vIGludm9rZSB0aGUgc3Vic2NyaWJlIG1pZGRsZXdhcmVzXG4gICAgICBsZXQgcmVzcG9uc2UgPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICBpZih0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgIGZvcihjb25zdCBtdyBvZiB0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgICAgaWYobXcuc3Vic2NyaWJlKSByZXNwb25zZSA9IGF3YWl0IG13LnN1YnNjcmliZShyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW52b2tlIHRoZSBjYWxsYmFja1xuICAgICAgbGV0IHJlcGx5ID0gYXdhaXQgY2FsbGJhY2soeyByZXNwb25zZSwgbWVzc2FnZSB9KTtcblxuICAgICAgLy8gaWYgcmVwbHlUbyBhbmQgcmVzdWx0IHBhc3NlZCwgY2FsbCBlbSBiYWNrXG4gICAgICBpZighIW1lc3NhZ2UucHJvcGVydGllcy5yZXBseVRvICYmIHJlcGx5KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbHlUbywgY29ycmVsYXRpb25JZCB9ID0gbWVzc2FnZS5wcm9wZXJ0aWVzO1xuICAgICAgICBcbiAgICAgICAgLy8gaW52b2tlIHB1Ymxpc2ggbWlkZGxld2FyZXNcbiAgICAgICAgaWYodGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgIGZvcihjb25zdCBtdyBvZiB0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgICAgICBpZihtdy5wdWJsaXNoKSByZXBseSA9IGF3YWl0IG13LnB1Ymxpc2gocmVwbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hhbm5lbC5zZW5kVG9RdWV1ZShyZXBseVRvLCByZXBseSwgeyBjb3JyZWxhdGlvbklkIH0pO1xuICAgICAgfVxuICAgIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgcHVyZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbC5wdXJnZVF1ZXVlKHRoaXMubmFtZSk7XG4gIH1cblxufVxuIl19