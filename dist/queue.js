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
    constructor(client) {
        super();
        this.client = client;
        this.queue = this.createQueue();
    }
    get options() {
        const opts = this._options ?
            this._options : Reflect.getMetadata(types_1.NAME_KEY, this);
        return Object.assign({ durable: false, noAck: true }, opts);
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
            this.rpcQueue = yield chnl.assertQueue('', { exclusive: true });
            chnl.consume(this.rpcQueue.queue, (result) => {
                this.emit(result.properties.correlationId, result);
            }, { noAck: true });
        });
    }
}
exports.AmqpQueue = AmqpQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRCQUEwQjtBQUMxQixtQ0FBc0M7QUFFdEMsbUNBQWlHO0FBRWpHLG1DQUFtQztBQUVuQyxlQUEwQixTQUFRLHFCQUFZO0lBa0I1QyxZQUFvQixNQUFrQjtRQUNwQyxLQUFLLEVBQUUsQ0FBQztRQURVLFdBQU0sR0FBTixNQUFNLENBQVk7UUFFcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQWhCRCxJQUFZLE9BQU87UUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVE7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGdCQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEQsTUFBTSxpQkFDSixPQUFPLEVBQUUsS0FBSyxFQUNkLEtBQUssRUFBRSxJQUFJLElBQ1IsSUFBSSxFQUNQO0lBQ0osQ0FBQztJQVNLLFNBQVMsQ0FBQyxRQUE0QixFQUFFLFVBQTRCLEVBQUU7O1lBQzFFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDdkMsTUFBTSxJQUFJLHFCQUFhLElBQUksQ0FBQyxPQUFPLEVBQUssT0FBTyxDQUFFLENBQUM7WUFFbEQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFPLE9BQVk7Z0JBQ3hELEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssa0JBQWtC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QUFNLENBQUMsT0FBTyxDQUFDO2dCQUN2QyxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV0RSxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pCLENBQUM7WUFBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNWLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNaLENBQUM7UUFDSCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVhLGNBQWM7O1lBQzFCLEVBQUUsQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBRTdCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU07Z0JBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckQsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUFBO0NBRUY7QUEvSUQsOEJBK0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBBbXFwQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHsgTkFNRV9LRVksIFF1ZXVlT3B0aW9ucywgUHVibGlzaE9wdGlvbnMsIFN1YnNjcmliZU9wdGlvbnMsIFJlcGx5T3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCAqIGFzIHNob3J0aWQgZnJvbSAnc2hvcnRpZCc7XG5cbmV4cG9ydCBjbGFzcyBBbXFwUXVldWU8VD4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIHF1ZXVlOiBhbnk7XG4gIHJwY1F1ZXVlOiBhbnk7XG5cbiAgcHJpdmF0ZSBnZXQgb3B0aW9ucygpOiBRdWV1ZU9wdGlvbnMge1xuICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vcHRpb25zID8gXG4gICAgICB0aGlzLl9vcHRpb25zIDogUmVmbGVjdC5nZXRNZXRhZGF0YShOQU1FX0tFWSwgdGhpcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZHVyYWJsZTogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZSxcbiAgICAgIC4uLm9wdHMgXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX29wdGlvbnM6IFF1ZXVlT3B0aW9ucztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNsaWVudDogQW1xcENsaWVudCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5xdWV1ZSA9IHRoaXMuY3JlYXRlUXVldWUoKTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShjYWxsYmFjazogKG1lc3NhZ2U6IFQpID0+IHt9LCBvcHRpb25zOiBTdWJzY3JpYmVPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNvbnN0IG9wdHM6IGFueSA9IHsgLi4udGhpcy5vcHRpb25zLCAuLi5vcHRpb25zIH07XG5cbiAgICBpZiAob3B0aW9ucy5wcmVmZXRjaCkge1xuICAgICAgY2hubC5wcmVmZXRjaChvcHRpb25zLnByZWZldGNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hubC5jb25zdW1lKHRoaXMub3B0aW9ucy5uYW1lLCBhc3luYyAobWVzc2FnZTogYW55KSA9PiB7XG4gICAgICBpZihvcHRzLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gSlNPTi5wYXJzZShtZXNzYWdlLmNvbnRlbnQudG9TdHJpbmcoKSk7XG4gICAgICB9XG5cbiAgICAgIG1lc3NhZ2UucmVwbHkgPSAoY29udGVudDogYW55LCByZXBseU9wdGlvbnM6IFJlcGx5T3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICAgIHJlcGx5T3B0aW9ucy5yZXBseVRvID0gbWVzc2FnZS5wcm9wZXJ0aWVzLnJlcGx5VG87XG4gICAgICAgIHJlcGx5T3B0aW9ucy5jb3JyZWxhdGlvbklkID0gbWVzc2FnZS5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQ7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcGx5KGNvbnRlbnQsIHJlcGx5T3B0aW9ucyk7XG4gICAgICB9O1xuXG4gICAgICBtZXNzYWdlLmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5hY2sobWVzc2FnZSk7XG4gICAgICB9O1xuXG4gICAgICBjYWxsYmFjayhtZXNzYWdlKTtcbiAgICB9LCBvcHRzKTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2goY29udGVudDogYW55LCBvcHRpb25zOiBQdWJsaXNoT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjb25zdCBvcHRzOiBhbnkgPSB7IC4uLnRoaXMub3B0aW9ucywgLi4ub3B0aW9uc307XG5cbiAgICBpZih0aGlzLnJwY1F1ZXVlKSB7XG4gICAgICBjb25zdCBjb3JyZWxhdGlvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuICAgICAgb3B0cy5jb3JyZWxhdGlvbklkID0gY29ycmVsYXRpb25JZDtcbiAgICAgIG9wdHMucmVwbHlUbyA9IHRoaXMucnBjUXVldWUucXVldWU7XG4gICAgfVxuXG4gICAgaWYob3B0cy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gICAgICBjb250ZW50ID0gbmV3IEJ1ZmZlcihqc29uKTtcbiAgICB9XG5cbiAgICBjaG5sLnNlbmRUb1F1ZXVlKHRoaXMub3B0aW9ucy5uYW1lLCBjb250ZW50LCBvcHRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50LFxuICAgICAgcHJvcGVydGllczogb3B0c1xuICAgIH07XG4gIH1cblxuICBhc3luYyByZXBseU9mKGlkT3JNZXNzYWdlOiBzdHJpbmd8YW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICBsZXQgaWQgPSBpZE9yTWVzc2FnZTtcbiAgICBpZih0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICBpZCA9IGlkT3JNZXNzYWdlLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5vbmNlKGlkLCAobWVzc2FnZTogYW1xcC5NZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1lc3NhZ2UuY29udGVudCA9IEpTT04ucGFyc2UobWVzc2FnZS5jb250ZW50LnRvU3RyaW5nKCkpO1xuICAgICAgICAgIH0gY2F0Y2goZSkgeyAvKiBkbyBub3RoaW5nICovIH1cbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKG1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyByZXBseShjb250ZW50OiBhbnksIG9wdGlvbnM6IFJlcGx5T3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcblxuICAgIGlmKHRoaXMub3B0aW9ucy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gICAgICBjb250ZW50ID0gbmV3IEJ1ZmZlcihqc29uKTtcbiAgICB9XG5cbiAgICBjaG5sLnNlbmRUb1F1ZXVlKG9wdGlvbnMucmVwbHlUbywgY29udGVudCwgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudCxcbiAgICAgIHByb3BlcnRpZXM6IG9wdGlvbnNcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgYWNrKG1lc3NhZ2U6IGFtcXAuTWVzc2FnZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNobmwuYWNrKG1lc3NhZ2UpO1xuICB9XG5cbiAgYXN5bmMgcHVyZ2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICByZXR1cm4gY2hubC5wdXJnZVF1ZXVlKHRoaXMub3B0aW9ucy5uYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUXVldWUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29ubiA9IGF3YWl0IHRoaXMuY2xpZW50LmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgICAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUodGhpcy5vcHRpb25zLm5hbWUsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5jb25zdW1lUmVwbGllcygpO1xuICAgICAgICByZXNvbHZlKHF1ZXVlKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNvbnN1bWVSZXBsaWVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmKCF0aGlzLm9wdGlvbnMucnBjKSByZXR1cm47XG5cbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICB0aGlzLnJwY1F1ZXVlID0gYXdhaXQgY2hubC5hc3NlcnRRdWV1ZSgnJywgeyBleGNsdXNpdmU6IHRydWUgfSk7XG4gICAgXG4gICAgY2hubC5jb25zdW1lKHRoaXMucnBjUXVldWUucXVldWUsIChyZXN1bHQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChyZXN1bHQucHJvcGVydGllcy5jb3JyZWxhdGlvbklkLCByZXN1bHQpO1xuICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG4gIH1cbiAgXG59XG4iXX0=