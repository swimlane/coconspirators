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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0EsbUNBQW1DO0FBRW5DO0lBTUUsWUFBb0IsT0FBTyxFQUFVLElBQUksRUFBRSxVQUFlLEVBQUUsRUFBRSxHQUFHLFdBQWtCO1FBQS9ELFlBQU8sR0FBUCxPQUFPLENBQUE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2pDLENBQUM7SUFFSyxVQUFVOztZQUNkLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FBQTtJQUVLLE9BQU8sQ0FBQyxPQUFZLEVBQUUsVUFBZSxFQUFFOztZQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpDLG9CQUFvQjtZQUNwQixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLEtBQUssRUFBRSxJQUFJO2dCQUNYLGFBQWE7YUFDZCxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRVosb0JBQW9CO1lBQ3BCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQztZQUN6QyxDQUFDO1lBRUQscUJBQXFCO1lBQ3JCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixHQUFHLENBQUEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDakMsRUFBRSxDQUFBLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQzt3QkFBQyxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO1lBQ0gsQ0FBQztZQUVELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFOUMsTUFBTSxDQUFDO2dCQUNMLGFBQWE7YUFDZCxDQUFDO1FBQ0osQ0FBQztLQUFBO0lBRUssU0FBUyxDQUFDLElBQVksRUFBRSxFQUFZLEVBQUUsVUFBZSxFQUFFOztZQUMzRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7WUFFaEMsb0JBQW9CO1lBQ3BCLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUN0QixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO2FBQzFCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFWixzQkFBc0I7WUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFPLEdBQWlCO2dCQUNyRCxtQ0FBbUM7Z0JBQ25DLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7Z0JBQzNCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUNwQixHQUFHLENBQUEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsRUFBRSxDQUFBLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQzs0QkFBQyxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMzRCxDQUFDO2dCQUNILENBQUM7Z0JBRUQsc0JBQXNCO2dCQUN0QixJQUFJLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFL0IsNkNBQTZDO2dCQUM3QyxFQUFFLENBQUEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDckMsTUFBTSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztvQkFFaEUsNkJBQTZCO29CQUM3QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDcEIsR0FBRyxDQUFBLENBQUMsTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ2pDLEVBQUUsQ0FBQSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0NBQUMsS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDakQsQ0FBQztvQkFDSCxDQUFDO29CQUVELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO1lBQ0gsQ0FBQyxDQUFBLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDZCxDQUFDO0tBQUE7SUFFRCxLQUFLO1FBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBRUY7QUEzRkQsc0JBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCAqIGFzIHNob3J0aWQgZnJvbSAnc2hvcnRpZCc7XG5cbmV4cG9ydCBjbGFzcyBRdWV1ZSB7XG5cbiAgb3B0aW9uczogYW55O1xuICBxOiBhbnk7XG4gIG1pZGRsZXdhcmVzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoYW5uZWwsIHByaXZhdGUgbmFtZSwgb3B0aW9uczogYW55ID0ge30sIC4uLm1pZGRsZXdhcmVzOiBhbnlbXSkgeyBcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGR1cmFibGU6IGZhbHNlLFxuICAgICAgbm9BY2s6IHRydWVcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMubWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlcztcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuICAgIHJldHVybiB0aGlzLnEgPSBjaG5sLmFzc2VydFF1ZXVlKHRoaXMubmFtZSwgdGhpcy5vcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2gobWVzc2FnZTogYW55LCBvcHRpb25zOiBhbnkgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcbiAgICBjb25zdCBjb3JyZWxhdGlvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuXG4gICAgLy8gdHJhbnNwb3NlIG9wdGlvbnNcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBwZXJzaXN0ZW50OiBmYWxzZSxcbiAgICAgIG5vQWNrOiB0cnVlLFxuICAgICAgY29ycmVsYXRpb25JZFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gc2V0dXAgcmVwbHkgbmFtZXNcbiAgICBpZih0aGlzLm9wdGlvbnMucmVwbHkpIHtcbiAgICAgIG9wdGlvbnMucmVwbHlUbyA9IGAke3RoaXMubmFtZX1fcmVwbHlgO1xuICAgIH1cblxuICAgIC8vIGludm9rZSBtaWRkbGV3YXJlc1xuICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgIGZvcihjb25zdCBtdyBvZiB0aGlzLm1pZGRsZXdhcmVzKSB7XG4gICAgICAgIGlmKG13LnB1Ymxpc2gpIG1lc3NhZ2UgPSBhd2FpdCBtdy5wdWJsaXNoKG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNobmwuc2VuZFRvUXVldWUodGhpcy5uYW1lLCBtZXNzYWdlLCBvcHRpb25zKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb3JyZWxhdGlvbklkXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbiwgb3B0aW9uczogYW55ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAvLyB0cmFuc3Bvc2Ugb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHsgXG4gICAgICBub0FjazogdGhpcy5vcHRpb25zLm5vQWNrIFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gY29uc3VtZSB0aGUgbWVzc2FnZVxuICAgIHJldHVybiBjaG5sLmNvbnN1bWUodGhpcy5uYW1lLCBhc3luYyAobXNnOiBhbXFwLk1lc3NhZ2UpID0+IHtcbiAgICAgIC8vIGludm9rZSB0aGUgc3Vic2NyaWJlIG1pZGRsZXdhcmVzXG4gICAgICBsZXQgcmVzcG9uc2UgPSBtc2cuY29udGVudDtcbiAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgZm9yKGNvbnN0IG13IG9mIHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBpZihtdy5zdWJzY3JpYmUpIHJlc3BvbnNlID0gYXdhaXQgbXcuc3Vic2NyaWJlKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpbnZva2UgdGhlIGNhbGxiYWNrXG4gICAgICBsZXQgcmVwbHkgPSBhd2FpdCBmbihyZXNwb25zZSk7XG5cbiAgICAgIC8vIGlmIHJlcGx5VG8gYW5kIHJlc3VsdCBwYXNzZWQsIGNhbGwgZW0gYmFja1xuICAgICAgaWYoISFtc2cucHJvcGVydGllcy5yZXBseVRvICYmIHJlcGx5KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbHlUbywgY29ycmVsYXRpb25JZCB9ID0gbXNnLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZDtcbiAgICAgICAgXG4gICAgICAgIC8vIGludm9rZSBwdWJsaXNoIG1pZGRsZXdhcmVzXG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcucHVibGlzaCkgcmVwbHkgPSBhd2FpdCBtdy5wdWJsaXNoKHJlcGx5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoYW5uZWwuc2VuZFRvUXVldWUocmVwbHlUbywgcmVwbHksIHsgY29ycmVsYXRpb25JZCB9KTtcbiAgICAgIH1cbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHB1cmdlKCkge1xuICAgIHJldHVybiB0aGlzLmNoYW5uZWwucHVyZ2VRdWV1ZSh0aGlzLm5hbWUpO1xuICB9XG5cbn1cbiJdfQ==