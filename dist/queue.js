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
require("reflect-metadata");
const events_1 = require("events");
const types_1 = require("./types");
const shortid = require("shortid");
class AmqpQueue extends events_1.EventEmitter {
    constructor(client, options) {
        super();
        this.client = client;
        this.options = {
            durable: false,
            noAck: true
        };
        // if decorated, get decorations and merge
        const metadata = Reflect.getMetadata(types_1.NAME_KEY, this);
        if (metadata) {
            Object.assign(this.options, metadata);
        }
        // if options passed in manually, extend options
        if (options) {
            Object.assign(this.options, options);
        }
        this.queue = this.createQueue();
    }
    subscribe(callback, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.client.channel;
            const opts = Object.assign({}, this.options, options);
            if (options.prefetch) {
                chnl.prefetch(options.prefetch);
            }
            return chnl.consume(this.options.name, (message) => __awaiter(this, void 0, void 0, function* () {
                if (opts.contentType === 'application/json') {
                    message.content = JSON.parse(message.content.toString());
                }
                message.reply = (content, replyOptions = {}) => {
                    replyOptions.replyTo = message.properties.replyTo;
                    replyOptions.correlationId = message.properties.correlationId;
                    return this.reply(content, replyOptions);
                };
                message.ack = () => {
                    this.ack(message);
                };
                callback(message);
            }), opts);
        });
    }
    publish(content, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.client.channel;
            const opts = Object.assign({}, this.options, options);
            if (this.rpcQueue) {
                const correlationId = shortid.generate();
                opts.correlationId = correlationId;
                opts.replyTo = this.rpcQueue.queue;
            }
            if (opts.contentType === 'application/json') {
                const json = JSON.stringify(content);
                content = new Buffer(json);
            }
            chnl.sendToQueue(this.options.name, content, opts);
            return {
                content,
                properties: opts
            };
        });
    }
    replyOf(idOrMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = idOrMessage;
            if (typeof id !== 'string') {
                id = idOrMessage.properties.correlationId;
            }
            return new Promise((resolve, reject) => {
                this.once(id, (message) => {
                    if (this.options.contentType === 'application/json') {
                        try {
                            message.content = JSON.parse(message.content.toString());
                        }
                        catch (e) { }
                    }
                    resolve(message);
                });
            });
        });
    }
    reply(content, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.client.channel;
            if (this.options.contentType === 'application/json') {
                const json = JSON.stringify(content);
                content = new Buffer(json);
            }
            chnl.sendToQueue(options.replyTo, content, options);
            return {
                content,
                properties: options
            };
        });
    }
    ack(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.client.channel;
            chnl.ack(message);
        });
    }
    purge() {
        return __awaiter(this, void 0, void 0, function* () {
            const chnl = yield this.client.channel;
            return chnl.purgeQueue(this.options.name);
        });
    }
    createQueue() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this.client.connection;
                const chnl = yield this.client.channel;
                const queue = yield chnl.assertQueue(this.options.name, this.options);
                yield this.consumeReplies();
                resolve(queue);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    consumeReplies() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.rpc)
                return;
            const chnl = yield this.client.channel;
            this.rpcQueue = yield chnl.assertQueue('', {
                exclusive: this.options.exclusive
            });
            chnl.consume(this.rpcQueue.queue, (result) => {
                this.emit(result.properties.correlationId, result);
            }, { noAck: true });
        });
    }
}
exports.AmqpQueue = AmqpQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRCQUEwQjtBQUMxQixtQ0FBc0M7QUFFdEMsbUNBQWlHO0FBRWpHLG1DQUFtQztBQUVuQyxlQUEwQixTQUFRLHFCQUFZO0lBUzVDLFlBQW9CLE1BQWtCLEVBQUUsT0FBc0I7UUFDNUQsS0FBSyxFQUFFLENBQUM7UUFEVSxXQUFNLEdBQU4sTUFBTSxDQUFZO1FBTHRDLFlBQU8sR0FBaUI7WUFDdEIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUM7UUFLQSwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JELEVBQUUsQ0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELGdEQUFnRDtRQUNoRCxFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUssU0FBUyxDQUFDLFFBQTRCLEVBQUUsVUFBNEIsRUFBRTs7WUFDMUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxNQUFNLElBQUkscUJBQWEsSUFBSSxDQUFDLE9BQU8sRUFBSyxPQUFPLENBQUUsQ0FBQztZQUVsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMs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QUM7WUFDckQsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUFBO0NBRUY7QUFwSkQsOEJBb0pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBBbXFwQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHsgTkFNRV9LRVksIFF1ZXVlT3B0aW9ucywgUHVibGlzaE9wdGlvbnMsIFN1YnNjcmliZU9wdGlvbnMsIFJlcGx5T3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCAqIGFzIHNob3J0aWQgZnJvbSAnc2hvcnRpZCc7XG5cbmV4cG9ydCBjbGFzcyBBbXFwUXVldWU8VD4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIHF1ZXVlOiBhbnk7XG4gIHJwY1F1ZXVlOiBhbnk7XG4gIG9wdGlvbnM6IFF1ZXVlT3B0aW9ucyA9IHtcbiAgICBkdXJhYmxlOiBmYWxzZSxcbiAgICBub0FjazogdHJ1ZVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2xpZW50OiBBbXFwQ2xpZW50LCBvcHRpb25zPzogUXVldWVPcHRpb25zKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIGlmIGRlY29yYXRlZCwgZ2V0IGRlY29yYXRpb25zIGFuZCBtZXJnZVxuICAgIGNvbnN0IG1ldGFkYXRhID0gUmVmbGVjdC5nZXRNZXRhZGF0YShOQU1FX0tFWSwgdGhpcyk7XG4gICAgaWYobWV0YWRhdGEpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBtZXRhZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gaWYgb3B0aW9ucyBwYXNzZWQgaW4gbWFudWFsbHksIGV4dGVuZCBvcHRpb25zXG4gICAgaWYob3B0aW9ucykge1xuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHRoaXMucXVldWUgPSB0aGlzLmNyZWF0ZVF1ZXVlKCk7XG4gIH1cblxuICBhc3luYyBzdWJzY3JpYmUoY2FsbGJhY2s6IChtZXNzYWdlOiBUKSA9PiB7fSwgb3B0aW9uczogU3Vic2NyaWJlT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjb25zdCBvcHRzOiBhbnkgPSB7IC4uLnRoaXMub3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuXG4gICAgaWYgKG9wdGlvbnMucHJlZmV0Y2gpIHtcbiAgICAgIGNobmwucHJlZmV0Y2gob3B0aW9ucy5wcmVmZXRjaCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNobmwuY29uc3VtZSh0aGlzLm9wdGlvbnMubmFtZSwgYXN5bmMgKG1lc3NhZ2U6IGFueSkgPT4ge1xuICAgICAgaWYob3B0cy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICAgIG1lc3NhZ2UuY29udGVudCA9IEpTT04ucGFyc2UobWVzc2FnZS5jb250ZW50LnRvU3RyaW5nKCkpO1xuICAgICAgfVxuXG4gICAgICBtZXNzYWdlLnJlcGx5ID0gKGNvbnRlbnQ6IGFueSwgcmVwbHlPcHRpb25zOiBSZXBseU9wdGlvbnMgPSB7fSkgPT4ge1xuICAgICAgICByZXBseU9wdGlvbnMucmVwbHlUbyA9IG1lc3NhZ2UucHJvcGVydGllcy5yZXBseVRvO1xuICAgICAgICByZXBseU9wdGlvbnMuY29ycmVsYXRpb25JZCA9IG1lc3NhZ2UucHJvcGVydGllcy5jb3JyZWxhdGlvbklkO1xuICAgICAgICByZXR1cm4gdGhpcy5yZXBseShjb250ZW50LCByZXBseU9wdGlvbnMpO1xuICAgICAgfTtcblxuICAgICAgbWVzc2FnZS5hY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuYWNrKG1lc3NhZ2UpO1xuICAgICAgfTtcblxuICAgICAgY2FsbGJhY2sobWVzc2FnZSk7XG4gICAgfSwgb3B0cyk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKGNvbnRlbnQ6IGFueSwgb3B0aW9uczogUHVibGlzaE9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgY29uc3Qgb3B0czogYW55ID0geyAuLi50aGlzLm9wdGlvbnMsIC4uLm9wdGlvbnN9O1xuXG4gICAgaWYodGhpcy5ycGNRdWV1ZSkge1xuICAgICAgY29uc3QgY29ycmVsYXRpb25JZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgIG9wdHMuY29ycmVsYXRpb25JZCA9IGNvcnJlbGF0aW9uSWQ7XG4gICAgICBvcHRzLnJlcGx5VG8gPSB0aGlzLnJwY1F1ZXVlLnF1ZXVlO1xuICAgIH1cblxuICAgIGlmKG9wdHMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICAgICAgY29udGVudCA9IG5ldyBCdWZmZXIoanNvbik7XG4gICAgfVxuXG4gICAgY2hubC5zZW5kVG9RdWV1ZSh0aGlzLm9wdGlvbnMubmFtZSwgY29udGVudCwgb3B0cyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudCxcbiAgICAgIHByb3BlcnRpZXM6IG9wdHNcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcmVwbHlPZihpZE9yTWVzc2FnZTogc3RyaW5nfGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IGlkID0gaWRPck1lc3NhZ2U7XG4gICAgaWYodHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgICAgaWQgPSBpZE9yTWVzc2FnZS5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMub25jZShpZCwgKG1lc3NhZ2U6IGFtcXAuTWVzc2FnZSkgPT4ge1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBKU09OLnBhcnNlKG1lc3NhZ2UuY29udGVudC50b1N0cmluZygpKTtcbiAgICAgICAgICB9IGNhdGNoKGUpIHsgLyogZG8gbm90aGluZyAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZShtZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcmVwbHkoY29udGVudDogYW55LCBvcHRpb25zOiBSZXBseU9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICAgICAgY29udGVudCA9IG5ldyBCdWZmZXIoanNvbik7XG4gICAgfVxuXG4gICAgY2hubC5zZW5kVG9RdWV1ZShvcHRpb25zLnJlcGx5VG8sIGNvbnRlbnQsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQsXG4gICAgICBwcm9wZXJ0aWVzOiBvcHRpb25zXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGFjayhtZXNzYWdlOiBhbXFwLk1lc3NhZ2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjaG5sLmFjayhtZXNzYWdlKTtcbiAgfVxuXG4gIGFzeW5jIHB1cmdlKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgcmV0dXJuIGNobmwucHVyZ2VRdWV1ZSh0aGlzLm9wdGlvbnMubmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVF1ZXVlKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNsaWVudC5jb25uZWN0aW9uO1xuICAgICAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICAgICAgY29uc3QgcXVldWUgPSBhd2FpdCBjaG5sLmFzc2VydFF1ZXVlKHRoaXMub3B0aW9ucy5uYW1lLCB0aGlzLm9wdGlvbnMpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuY29uc3VtZVJlcGxpZXMoKTtcbiAgICAgICAgcmVzb2x2ZShxdWV1ZSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjb25zdW1lUmVwbGllcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZighdGhpcy5vcHRpb25zLnJwYykgcmV0dXJuO1xuXG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgdGhpcy5ycGNRdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUoJycsIHsgXG4gICAgICBleGNsdXNpdmU6IHRoaXMub3B0aW9ucy5leGNsdXNpdmUgXG4gICAgfSk7XG4gICAgXG4gICAgY2hubC5jb25zdW1lKHRoaXMucnBjUXVldWUucXVldWUsIChyZXN1bHQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChyZXN1bHQucHJvcGVydGllcy5jb3JyZWxhdGlvbklkLCByZXN1bHQpO1xuICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG4gIH1cbiAgXG59XG4iXX0=