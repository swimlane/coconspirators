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
            return chnl.consume(this.name, (message) => __awaiter(this, void 0, void 0, function* () {
                // invoke the subscribe middlewares
                let response = message.content;
                if (this.middlewares) {
                    for (const mw of this.middlewares) {
                        if (mw.subscribe)
                            response = yield mw.subscribe(response);
                    }
                }
                // invoke the callback
                let reply = yield fn({ response, message });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsbUNBQW1DO0FBRW5DO0lBTUUsWUFBb0IsT0FBTyxFQUFVLElBQUksRUFBRSxVQUFlLEVBQUUsRUFBRSxHQUFHLFdBQWtCO1FBQS9ELFlBQU8sR0FBUCxPQUFPLENBQUE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFSyxVQUFVOztZQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FBQTtJQUVLLE9BQU8sQ0FBQyxPQUFZLEVBQUUsVUFBZSxFQUFFOztZQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpDLG9CQUFvQjtZQUNwQixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLEtBQUssRUFBRSxJQUFJO2dCQUNYLGFBQWE7YUFDZCxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRVosb0JBQW9CO1lBQ3BCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFD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ICdhbXFwbGliJztcbmltcG9ydCAqIGFzIHNob3J0aWQgZnJvbSAnc2hvcnRpZCc7XG5cbmV4cG9ydCBjbGFzcyBRdWV1ZSB7XG5cbiAgb3B0aW9uczogYW55O1xuICBxOiBhbnk7XG4gIG1pZGRsZXdhcmVzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoYW5uZWwsIHByaXZhdGUgbmFtZSwgb3B0aW9uczogYW55ID0ge30sIC4uLm1pZGRsZXdhcmVzOiBhbnlbXSkgeyBcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGR1cmFibGU6IGZhbHNlLFxuICAgICAgbm9BY2s6IHRydWVcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMubWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcztcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuICAgIHJldHVybiB0aGlzLnEgPSBjaG5sLmFzc2VydFF1ZXVlKHRoaXMubmFtZSwgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2gobWVzc2FnZTogYW55LCBvcHRpb25zOiBhbnkgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcbiAgICBjb25zdCBjb3JyZWxhdGlvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuXG4gICAgLy8gdHJhbnNwb3NlIG9wdGlvbnNcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBwZXJzaXN0ZW50OiBmYWxzZSxcbiAgICAgIG5vQWNrOiB0cnVlLFxuICAgICAgY29ycmVsYXRpb25JZFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gc2V0dXAgcmVwbHkgbmFtZXNcbiAgICBpZih0aGlzLm9wdGlvbnMucmVwbHkpIHtcbiAgICAgIG9wdGlvbnMucmVwbHlUbyA9IGAke3RoaXMubmFtZX1fcmVwbHlgO1xuICAgIH1cblxuICAgIC8vIGludm9rZSBtaWRkbGV3YXJlc1xuICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgIGZvcihjb25zdCBtdyBvZiB0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgIGlmKG13LnB1Ymxpc2gpIG1lc3NhZ2UgPSBhd2FpdCBtdy5wdWJsaXNoKG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNobmwuc2VuZFRvUXVldWUodGhpcy5uYW1lLCBtZXNzYWdlLCBvcHRpb25zKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb3JyZWxhdGlvbklkXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShmbjogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuXG4gICAgLy8gdHJhbnNwb3NlIG9wdGlvbnNcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IFxuICAgICAgbm9BY2s6IHRoaXMub3B0aW9ucy5ub0FjayBcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIGNvbnN1bWUgdGhlIG1lc3NhZ2VcbiAgICByZXR1cm4gY2hubC5jb25zdW1lKHRoaXMubmFtZSwgYXN5bmMgKG1lc3NhZ2U6IGFtcXAuTWVzc2FnZSkgPT4ge1xuICAgICAgLy8gaW52b2tlIHRoZSBzdWJzY3JpYmUgbWlkZGxld2FyZXNcbiAgICAgIGxldCByZXNwb25zZSA9IG1lc3NhZ2UuY29udGVudDtcbiAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBpZihtdy5zdWJzY3JpYmUpIHJlc3BvbnNlID0gYXdhaXQgbXcuc3Vic2NyaWJlKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbnZva2UgdGhlIGNhbGxiYWNrXG4gICAgICBsZXQgcmVwbHkgPSBhd2FpdCBmbih7IHJlc3BvbnNlLCBtZXNzYWdlIH0pO1xuXG4gICAgICAvLyBpZiByZXBseVRvIGFuZCByZXN1bHQgcGFzc2VkLCBjYWxsIGVtIGJhY2tcbiAgICAgIGlmKCEhbWVzc2FnZS5wcm9wZXJ0aWVzLnJlcGx5VG8gJiYgcmVwbHkpIHtcbiAgICAgICAgY29uc3QgeyByZXBseVRvLCBjb3JyZWxhdGlvbklkIH0gPSBtZXNzYWdlLnByb3BlcnRpZXM7XG4gICAgICAgIFxuICAgICAgICAvLyBpbnZva2UgcHVibGlzaCBtaWRkbGV3YXJlc1xuICAgICAgICBpZih0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICAgIGlmKG13LnB1Ymxpc2gpIHJlcGx5ID0gYXdhaXQgbXcucHVibGlzaChyZXBseSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGFubmVsLnNlbmRUb1F1ZXVlKHJlcGx5VG8sIHJlcGx5LCB7IGNvcnJlbGF0aW9uSWQgfSk7XG4gICAgICB9XG4gICAgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBwdXJnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFubmVsLnB1cmdlUXVldWUodGhpcy5uYW1lKTtcbiAgfVxuXG59XG4iXX0=