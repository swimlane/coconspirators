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
                    const { replyTo, correlationId } = msg.properties;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsbUNBQW1DO0FBRW5DO0lBTUUsWUFBb0IsT0FBTyxFQUFVLElBQUksRUFBRSxVQUFlLEVBQUUsRUFBRSxHQUFHLFdBQWtCO1FBQS9ELFlBQU8sR0FBUCxPQUFPLENBQUE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFSyxVQUFVOztZQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FBQTtJQUVLLE9BQU8sQ0FBQyxPQUFZLEVBQUUsVUFBZSxFQUFFOztZQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpDLG9CQUFvQjtZQUNwQixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLEtBQUssRUFBRSxJQUFJO2dCQUNYLGFBQWE7YUFDZCxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRVosb0JBQW9CO1lBQ3BCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFD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KiBhcyBzaG9ydGlkIGZyb20gJ3Nob3J0aWQnO1xuXG5leHBvcnQgY2xhc3MgUXVldWUge1xuXG4gIG9wdGlvbnM6IGFueTtcbiAgcTogYW55O1xuICBtaWRkbGV3YXJlczogYW55W107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGFubmVsLCBwcml2YXRlIG5hbWUsIG9wdGlvbnM6IGFueSA9IHt9LCAuLi5taWRkbGV3YXJlczogYW55W10pIHsgXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBkdXJhYmxlOiBmYWxzZSxcbiAgICAgIG5vQWNrOiB0cnVlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXM7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcbiAgICByZXR1cm4gdGhpcy5xID0gY2hubC5hc3NlcnRRdWV1ZSh0aGlzLm5hbWUsIHRoaXMub3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKG1lc3NhZ2U6IGFueSwgb3B0aW9uczogYW55ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG4gICAgY29uc3QgY29ycmVsYXRpb25JZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcblxuICAgIC8vIHRyYW5zcG9zZSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgcGVyc2lzdGVudDogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZSxcbiAgICAgIGNvcnJlbGF0aW9uSWRcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIHNldHVwIHJlcGx5IG5hbWVzXG4gICAgaWYodGhpcy5vcHRpb25zLnJlcGx5KSB7XG4gICAgICBvcHRpb25zLnJlcGx5VG8gPSBgJHt0aGlzLm5hbWV9X3JlcGx5YDtcbiAgICB9XG5cbiAgICAvLyBpbnZva2UgbWlkZGxld2FyZXNcbiAgICBpZih0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICBpZihtdy5wdWJsaXNoKSBtZXNzYWdlID0gYXdhaXQgbXcucHVibGlzaChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjaG5sLnNlbmRUb1F1ZXVlKHRoaXMubmFtZSwgbWVzc2FnZSwgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29ycmVsYXRpb25JZFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzdWJzY3JpYmUoZm46IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnkgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcblxuICAgIC8vIHRyYW5zcG9zZSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBcbiAgICAgIG5vQWNrOiB0aGlzLm9wdGlvbnMubm9BY2sgXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBjb25zdW1lIHRoZSBtZXNzYWdlXG4gICAgcmV0dXJuIGNobmwuY29uc3VtZSh0aGlzLm5hbWUsIGFzeW5jIChtc2c6IGFtcXAuTWVzc2FnZSkgPT4ge1xuICAgICAgLy8gaW52b2tlIHRoZSBzdWJzY3JpYmUgbWlkZGxld2FyZXNcbiAgICAgIGxldCByZXNwb25zZSA9IG1zZy5jb250ZW50O1xuICAgICAgaWYodGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgIGlmKG13LnN1YnNjcmliZSkgcmVzcG9uc2UgPSBhd2FpdCBtdy5zdWJzY3JpYmUocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGludm9rZSB0aGUgY2FsbGJhY2tcbiAgICAgIGxldCByZXBseSA9IGF3YWl0IGZuKHJlc3BvbnNlKTtcblxuICAgICAgLy8gaWYgcmVwbHlUbyBhbmQgcmVzdWx0IHBhc3NlZCwgY2FsbCBlbSBiYWNrXG4gICAgICBpZighIW1zZy5wcm9wZXJ0aWVzLnJlcGx5VG8gJiYgcmVwbHkpIHtcbiAgICAgICAgY29uc3QgeyByZXBseVRvLCBjb3JyZWxhdGlvbklkIH0gPSBtc2cucHJvcGVydGllcztcbiAgICAgICAgXG4gICAgICAgIC8vIGludm9rZSBwdWJsaXNoIG1pZGRsZXdhcmVzXG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcucHVibGlzaCkgcmVwbHkgPSBhd2FpdCBtdy5wdWJsaXNoKHJlcGx5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoYW5uZWwuc2VuZFRvUXVldWUocmVwbHlUbywgcmVwbHksIHsgY29ycmVsYXRpb25JZCB9KTtcbiAgICAgIH1cbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHB1cmdlKCkge1xuICAgIHJldHVybiB0aGlzLmNoYW5uZWwucHVyZ2VRdWV1ZSh0aGlzLm5hbWUpO1xuICB9XG5cbn1cbiJdfQ==