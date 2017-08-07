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
            this.rpcQueue = yield chnl.assertQueue('', { exclusive: true });
            chnl.consume(this.rpcQueue.queue, (result) => {
                this.emit(result.properties.correlationId, result);
            }, { noAck: true });
        });
    }
}
exports.AmqpQueue = AmqpQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRCQUEwQjtBQUMxQixtQ0FBc0M7QUFFdEMsbUNBQWlHO0FBRWpHLG1DQUFtQztBQUVuQyxlQUEwQixTQUFRLHFCQUFZO0lBVTVDLFlBQW9CLE1BQWtCLEVBQUUsT0FBc0I7UUFDNUQsS0FBSyxFQUFFLENBQUM7UUFEVSxXQUFNLEdBQU4sTUFBTSxDQUFZO1FBTHRDLFlBQU8sR0FBaUI7WUFDdEIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUM7UUFLQSwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JELEVBQUUsQ0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELGdEQUFnRDtRQUNoRCxFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUssU0FBUyxDQUFDLFFBQTRCLEVBQUUsVUFBNEIsRUFBRTs7WUFDMUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxNQUFNLElBQUkscUJBQWEsSUFBSSxDQUFDLE9BQU8sRUFBSyxPQUFPLENBQUUsQ0FBQztZQUVsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMs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RSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0QixDQUFDO0tBQUE7Q0FFRjtBQW5KRCw4QkFtSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ3JlZmxlY3QtbWV0YWRhdGEnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IEFtcXBDbGllbnQgfSBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQgeyBOQU1FX0tFWSwgUXVldWVPcHRpb25zLCBQdWJsaXNoT3B0aW9ucywgU3Vic2NyaWJlT3B0aW9ucywgUmVwbHlPcHRpb25zIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgKiBhcyBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0ICogYXMgc2hvcnRpZCBmcm9tICdzaG9ydGlkJztcblxuZXhwb3J0IGNsYXNzIEFtcXBRdWV1ZTxUPiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgcXVldWU6IGFueTtcbiAgcnBjUXVldWU6IGFueTtcblxuICBvcHRpb25zOiBRdWV1ZU9wdGlvbnMgPSB7XG4gICAgZHVyYWJsZTogZmFsc2UsXG4gICAgbm9BY2s6IHRydWVcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNsaWVudDogQW1xcENsaWVudCwgb3B0aW9ucz86IFF1ZXVlT3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBpZiBkZWNvcmF0ZWQsIGdldCBkZWNvcmF0aW9ucyBhbmQgbWVyZ2VcbiAgICBjb25zdCBtZXRhZGF0YSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoTkFNRV9LRVksIHRoaXMpO1xuICAgIGlmKG1ldGFkYXRhKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgbWV0YWRhdGEpO1xuICAgIH1cblxuICAgIC8vIGlmIG9wdGlvbnMgcGFzc2VkIGluIG1hbnVhbGx5LCBleHRlbmQgb3B0aW9uc1xuICAgIGlmKG9wdGlvbnMpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlID0gdGhpcy5jcmVhdGVRdWV1ZSgpO1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKGNhbGxiYWNrOiAobWVzc2FnZTogVCkgPT4ge30sIG9wdGlvbnM6IFN1YnNjcmliZU9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgY29uc3Qgb3B0czogYW55ID0geyAuLi50aGlzLm9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcblxuICAgIGlmIChvcHRpb25zLnByZWZldGNoKSB7XG4gICAgICBjaG5sLnByZWZldGNoKG9wdGlvbnMucHJlZmV0Y2gpO1xuICAgIH1cblxuICAgIHJldHVybiBjaG5sLmNvbnN1bWUodGhpcy5vcHRpb25zLm5hbWUsIGFzeW5jIChtZXNzYWdlOiBhbnkpID0+IHtcbiAgICAgIGlmKG9wdHMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBKU09OLnBhcnNlKG1lc3NhZ2UuY29udGVudC50b1N0cmluZygpKTtcbiAgICAgIH1cblxuICAgICAgbWVzc2FnZS5yZXBseSA9IChjb250ZW50OiBhbnksIHJlcGx5T3B0aW9uczogUmVwbHlPcHRpb25zID0ge30pID0+IHtcbiAgICAgICAgcmVwbHlPcHRpb25zLnJlcGx5VG8gPSBtZXNzYWdlLnByb3BlcnRpZXMucmVwbHlUbztcbiAgICAgICAgcmVwbHlPcHRpb25zLmNvcnJlbGF0aW9uSWQgPSBtZXNzYWdlLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZDtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbHkoY29udGVudCwgcmVwbHlPcHRpb25zKTtcbiAgICAgIH07XG5cbiAgICAgIG1lc3NhZ2UuYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmFjayhtZXNzYWdlKTtcbiAgICAgIH07XG5cbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgIH0sIG9wdHMpO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChjb250ZW50OiBhbnksIG9wdGlvbnM6IFB1Ymxpc2hPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNvbnN0IG9wdHM6IGFueSA9IHsgLi4udGhpcy5vcHRpb25zLCAuLi5vcHRpb25zfTtcblxuICAgIGlmKHRoaXMucnBjUXVldWUpIHtcbiAgICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICBvcHRzLmNvcnJlbGF0aW9uSWQgPSBjb3JyZWxhdGlvbklkO1xuICAgICAgb3B0cy5yZXBseVRvID0gdGhpcy5ycGNRdWV1ZS5xdWV1ZTtcbiAgICB9XG5cbiAgICBpZihvcHRzLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgICAgIGNvbnRlbnQgPSBuZXcgQnVmZmVyKGpzb24pO1xuICAgIH1cblxuICAgIGNobmwuc2VuZFRvUXVldWUodGhpcy5vcHRpb25zLm5hbWUsIGNvbnRlbnQsIG9wdHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQsXG4gICAgICBwcm9wZXJ0aWVzOiBvcHRzXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHJlcGx5T2YoaWRPck1lc3NhZ2U6IHN0cmluZ3xhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIGxldCBpZCA9IGlkT3JNZXNzYWdlO1xuICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGlkID0gaWRPck1lc3NhZ2UucHJvcGVydGllcy5jb3JyZWxhdGlvbklkO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLm9uY2UoaWQsIChtZXNzYWdlOiBhbXFwLk1lc3NhZ2UpID0+IHtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gSlNPTi5wYXJzZShtZXNzYWdlLmNvbnRlbnQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgfSBjYXRjaChlKSB7IC8qIGRvIG5vdGhpbmcgKi8gfVxuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUobWVzc2FnZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHJlcGx5KGNvbnRlbnQ6IGFueSwgb3B0aW9uczogUmVwbHlPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgICAgIGNvbnRlbnQgPSBuZXcgQnVmZmVyKGpzb24pO1xuICAgIH1cblxuICAgIGNobmwuc2VuZFRvUXVldWUob3B0aW9ucy5yZXBseVRvLCBjb250ZW50LCBvcHRpb25zKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50LFxuICAgICAgcHJvcGVydGllczogb3B0aW9uc1xuICAgIH07XG4gIH1cblxuICBhc3luYyBhY2sobWVzc2FnZTogYW1xcC5NZXNzYWdlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgY2hubC5hY2sobWVzc2FnZSk7XG4gIH1cblxuICBhc3luYyBwdXJnZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIHJldHVybiBjaG5sLnB1cmdlUXVldWUodGhpcy5vcHRpb25zLm5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVRdWV1ZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb25uID0gYXdhaXQgdGhpcy5jbGllbnQuY29ubmVjdGlvbjtcbiAgICAgICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgY2hubC5hc3NlcnRRdWV1ZSh0aGlzLm9wdGlvbnMubmFtZSwgdGhpcy5vcHRpb25zKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmNvbnN1bWVSZXBsaWVzKCk7XG4gICAgICAgIHJlc29sdmUocXVldWUpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY29uc3VtZVJlcGxpZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYoIXRoaXMub3B0aW9ucy5ycGMpIHJldHVybjtcblxuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIHRoaXMucnBjUXVldWUgPSBhd2FpdCBjaG5sLmFzc2VydFF1ZXVlKCcnLCB7IGV4Y2x1c2l2ZTogdHJ1ZSB9KTtcbiAgICBcbiAgICBjaG5sLmNvbnN1bWUodGhpcy5ycGNRdWV1ZS5xdWV1ZSwgKHJlc3VsdCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KHJlc3VsdC5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQsIHJlc3VsdCk7XG4gICAgfSwgeyBub0FjazogdHJ1ZSB9KTtcbiAgfVxuICBcbn1cbiJdfQ==