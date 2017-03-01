"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    subscribe(name, fn, options = {}) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLG1DQUFtQztBQUVuQztJQU1FLFlBQW9CLE9BQU8sRUFBVSxJQUFJLEVBQUUsVUFBZSxFQUFFLEVBQUUsR0FBRyxXQUFrQjtRQUEvRCxZQUFPLEdBQVAsT0FBTyxDQUFBO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBQTtRQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDM0IsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsSUFBSTtTQUNaLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFWixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBRUssVUFBVTs7WUFDZCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1RCxDQUFDO0tBQUE7SUFFSyxPQUFPLENBQUMsT0FBWSxFQUFFLFVBQWUsRUFBRTs7WUFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2hDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV6QyxvQkFBb0I7WUFDcEIsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ3RCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxhQUFhO2FBQ2QsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVaLG9CQUFvQjtZQUNwQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JB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bSAnYW1xcGxpYic7XG5pbXBvcnQgKiBhcyBzaG9ydGlkIGZyb20gJ3Nob3J0aWQnO1xuXG5leHBvcnQgY2xhc3MgUXVldWUge1xuXG4gIG9wdGlvbnM6IGFueTtcbiAgcTogYW55O1xuICBtaWRkbGV3YXJlczogYW55W107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGFubmVsLCBwcml2YXRlIG5hbWUsIG9wdGlvbnM6IGFueSA9IHt9LCAuLi5taWRkbGV3YXJlczogYW55W10pIHsgXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBkdXJhYmxlOiBmYWxzZSxcbiAgICAgIG5vQWNrOiB0cnVlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXM7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcbiAgICByZXR1cm4gdGhpcy5xID0gY2hubC5hc3NlcnRRdWV1ZSh0aGlzLm5hbWUsIHRoaXMub3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKG1lc3NhZ2U6IGFueSwgb3B0aW9uczogYW55ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG4gICAgY29uc3QgY29ycmVsYXRpb25JZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcblxuICAgIC8vIHRyYW5zcG9zZSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgcGVyc2lzdGVudDogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZSxcbiAgICAgIGNvcnJlbGF0aW9uSWRcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIHNldHVwIHJlcGx5IG5hbWVzXG4gICAgaWYodGhpcy5vcHRpb25zLnJlcGx5KSB7XG4gICAgICBvcHRpb25zLnJlcGx5VG8gPSBgJHt0aGlzLm5hbWV9X3JlcGx5YDtcbiAgICB9XG5cbiAgICAvLyBpbnZva2UgbWlkZGxld2FyZXNcbiAgICBpZih0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICBpZihtdy5wdWJsaXNoKSBtZXNzYWdlID0gYXdhaXQgbXcucHVibGlzaChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaG5sLnNlbmRUb1F1ZXVlKHRoaXMubmFtZSwgbWVzc2FnZSwgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29ycmVsYXRpb25JZFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzdWJzY3JpYmUobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb24sIG9wdGlvbnM6IGFueSA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuXG4gICAgLy8gdHJhbnNwb3NlIG9wdGlvbnNcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IFxuICAgICAgbm9BY2s6IHRoaXMub3B0aW9ucy5ub0FjayBcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIGNvbnN1bWUgdGhlIG1lc3NhZ2VcbiAgICByZXR1cm4gY2hubC5jb25zdW1lKHRoaXMubmFtZSwgYXN5bmMgKG1zZzogYW1xcC5NZXNzYWdlKSA9PiB7XG4gICAgICAvLyBpbnZva2UgdGhlIHN1YnNjcmliZSBtaWRkbGV3YXJlc1xuICAgICAgbGV0IHJlc3BvbnNlID0gbXNnLmNvbnRlbnQ7XG4gICAgICBpZih0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgIGZvcihjb25zdCBtdyBvZiB0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgICAgaWYobXcuc3Vic2NyaWJlKSByZXNwb25zZSA9IGF3YWl0IG13LnN1YnNjcmliZShyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaW52b2tlIHRoZSBjYWxsYmFja1xuICAgICAgbGV0IHJlcGx5ID0gYXdhaXQgZm4ocmVzcG9uc2UpO1xuXG4gICAgICAvLyBpZiByZXBseVRvIGFuZCByZXN1bHQgcGFzc2VkLCBjYWxsIGVtIGJhY2tcbiAgICAgIGlmKCEhbXNnLnByb3BlcnRpZXMucmVwbHlUbyAmJiByZXBseSkge1xuICAgICAgICBjb25zdCB7IHJlcGx5VG8sIGNvcnJlbGF0aW9uSWQgfSA9IG1zZy5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQ7XG4gICAgICAgIFxuICAgICAgICAvLyBpbnZva2UgcHVibGlzaCBtaWRkbGV3YXJlc1xuICAgICAgICBpZih0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICAgIGlmKG13LnB1Ymxpc2gpIHJlcGx5ID0gYXdhaXQgbXcucHVibGlzaChyZXBseSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGFubmVsLnNlbmRUb1F1ZXVlKHJlcGx5VG8sIHJlcGx5LCB7IGNvcnJlbGF0aW9uSWQgfSk7XG4gICAgICB9XG4gICAgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBwdXJnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFubmVsLnB1cmdlUXVldWUodGhpcy5uYW1lKTtcbiAgfVxuXG59XG4iXX0=