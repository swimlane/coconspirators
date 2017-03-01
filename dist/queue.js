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
            return this.q = chnl.assertQueue(this.name, this.options);
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
                options.replyTo = `${this.name}_reply`;
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
    subscribe(fn, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.channel;
            // transpose options
            options = Object.assign({
                noAck: this.options.noAck
            }, options);
            // consume the message
            return chnl.consume(this.name, (msg) => __awaiter(this, void 0, void 0, function* () {
                // invoke the subscribe middlewares
                let response = msg.content;
                if (this.middlewares) {
                    for (const mw of this.middlewares) {
                        if (mw.subscribe)
                            response = yield mw.subscribe(response);
                    }
                }
                // invoke the callback
                let reply = yield fn(response);
                // if replyTo and result passed, call em back
                if (!!msg.properties.replyTo && reply) {
                    const { replyTo, correlationId } = msg.properties.correlationId;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsbUNBQW1DO0FBRW5DO0lBTUUsWUFBb0IsT0FBTyxFQUFVLElBQUksRUFBRSxVQUFlLEVBQUUsRUFBRSxHQUFHLFdBQWtCO1FBQS9ELFlBQU8sR0FBUCxPQUFPLENBQUE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFSyxVQUFVOztZQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FBQTtJQUVLLE9BQU8sQ0FBQyxPQUFZLEVBQUUsVUFBZSxFQUFFOztZQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpDLG9CQUFvQjtZQUNwQixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLEtBQUssRUFBRSxJQUFJO2dCQUNYLGFBQWE7YUFDZCxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRVosb0JBQW9CO1lBQ3BCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFD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O1xuaW1wb3J0ICogYXMgc2hvcnRpZCBmcm9tICdzaG9ydGlkJztcblxuZXhwb3J0IGNsYXNzIFF1ZXVlIHtcblxuICBvcHRpb25zOiBhbnk7XG4gIHE6IGFueTtcbiAgbWlkZGxld2FyZXM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2hhbm5lbCwgcHJpdmF0ZSBuYW1lLCBvcHRpb25zOiBhbnkgPSB7fSwgLi4ubWlkZGxld2FyZXM6IGFueVtdKSB7IFxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgZHVyYWJsZTogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5taWRkbGV3YXJlcyA9IG1pZGRsZXdhcmVzO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG4gICAgcmV0dXJuIHRoaXMucSA9IGNobmwuYXNzZXJ0UXVldWUodGhpcy5uYW1lLCB0aGlzLm9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChtZXNzYWdlOiBhbnksIG9wdGlvbnM6IGFueSA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG5cbiAgICAvLyB0cmFuc3Bvc2Ugb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICAgICAgbm9BY2s6IHRydWUsXG4gICAgICBjb3JyZWxhdGlvbklkXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBzZXR1cCByZXBseSBuYW1lc1xuICAgIGlmKHRoaXMub3B0aW9ucy5yZXBseSkge1xuICAgICAgb3B0aW9ucy5yZXBseVRvID0gYCR7dGhpcy5uYW1lfV9yZXBseWA7XG4gICAgfVxuXG4gICAgLy8gaW52b2tlIG1pZGRsZXdhcmVzXG4gICAgaWYodGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgaWYobXcucHVibGlzaCkgbWVzc2FnZSA9IGF3YWl0IG13LnB1Ymxpc2gobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2hubC5zZW5kVG9RdWV1ZSh0aGlzLm5hbWUsIG1lc3NhZ2UsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvcnJlbGF0aW9uSWRcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKGZuOiBGdW5jdGlvbiwgb3B0aW9uczogYW55ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAvLyB0cmFuc3Bvc2Ugb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHsgXG4gICAgICBub0FjazogdGhpcy5vcHRpb25zLm5vQWNrIFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gY29uc3VtZSB0aGUgbWVzc2FnZVxuICAgIHJldHVybiBjaG5sLmNvbnN1bWUodGhpcy5uYW1lLCBhc3luYyAobXNnOiBhbXFwLk1lc3NhZ2UpID0+IHtcbiAgICAgIC8vIGludm9rZSB0aGUgc3Vic2NyaWJlIG1pZGRsZXdhcmVzXG4gICAgICBsZXQgcmVzcG9uc2UgPSBtc2cuY29udGVudDtcbiAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBpZihtdy5zdWJzY3JpYmUpIHJlc3BvbnNlID0gYXdhaXQgbXcuc3Vic2NyaWJlKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbnZva2UgdGhlIGNhbGxiYWNrXG4gICAgICBsZXQgcmVwbHkgPSBhd2FpdCBmbihyZXNwb25zZSk7XG5cbiAgICAgIC8vIGlmIHJlcGx5VG8gYW5kIHJlc3VsdCBwYXNzZWQsIGNhbGwgZW0gYmFja1xuICAgICAgaWYoISFtc2cucHJvcGVydGllcy5yZXBseVRvICYmIHJlcGx5KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbHlUbywgY29ycmVsYXRpb25JZCB9ID0gbXNnLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZDtcbiAgICAgICAgXG4gICAgICAgIC8vIGludm9rZSBwdWJsaXNoIG1pZGRsZXdhcmVzXG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcucHVibGlzaCkgcmVwbHkgPSBhd2FpdCBtdy5wdWJsaXNoKHJlcGx5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoYW5uZWwuc2VuZFRvUXVldWUocmVwbHlUbywgcmVwbHksIHsgY29ycmVsYXRpb25JZCB9KTtcbiAgICAgIH1cbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHB1cmdlKCkge1xuICAgIHJldHVybiB0aGlzLmNoYW5uZWwucHVyZ2VRdWV1ZSh0aGlzLm5hbWUpO1xuICB9XG5cbn1cbiJdfQ==