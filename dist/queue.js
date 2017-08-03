"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const client_1 = require("./client");
const types_1 = require("./types");
const shortid = require("shortid");
const injection_js_1 = require("injection-js");
let AmqpQueue = class AmqpQueue extends events_1.EventEmitter {
    constructor(client, options) {
        super();
        this.client = client;
        if (options)
            this._options = options;
        this.createQueue();
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
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.client.channel;
            const chnl = yield this.client.channel;
            const queue = yield chnl.assertQueue(this.options.name, this.options);
            yield this.consumeReplies();
            return queue;
        });
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
};
AmqpQueue = __decorate([
    injection_js_1.Injectable(),
    __metadata("design:paramtypes", [client_1.AmqpClient, Object])
], AmqpQueue);
exports.AmqpQueue = AmqpQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRCQUEwQjtBQUMxQixtQ0FBc0M7QUFDdEMscUNBQXNDO0FBQ3RDLG1DQUFpRztBQUVqRyxtQ0FBbUM7QUFDbkMsK0NBQTBDO0FBRzFDLElBQWEsU0FBUyxHQUF0QixlQUEwQixTQUFRLHFCQUFZO0lBa0I1QyxZQUFvQixNQUFrQixFQUFFLE9BQWE7UUFDbkQsS0FBSyxFQUFFLENBQUM7UUFEVSxXQUFNLEdBQU4sTUFBTSxDQUFZO1FBRXBDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQztZQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBakJELElBQVksT0FBTztRQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUTtZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0RCxNQUFNLGlCQUNKLE9BQU8sRUFBRSxLQUFLLEVBQ2QsS0FBSyxFQUFFLElBQUksSUFDUixJQUFJLEVBQ1A7SUFDSixDQUFDO0lBVUssU0FBUyxDQUFDLFFBQTRCLEVBQUUsVUFBNEIsRUFBRTs7WUFDMUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxNQUFNLElBQUkscUJBQWEsSUFBSSxDQUFDLE9BQU8sRUFBSyxPQUFPLENBQUUsQ0FBQztZQUVsRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUVELE1BQU0sQ0FBQyxJ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QUFDO1lBQzFDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDdkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV0RSxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUU1QixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2YsQ0FBQztLQUFBO0lBRWEsY0FBYzs7WUFDMUIsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxNQUFNLENBQUM7WUFFN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVoRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTTtnQkFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRCxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0QixDQUFDO0tBQUE7Q0FFRixDQUFBO0FBM0lZLFNBQVM7SUFEckIseUJBQVUsRUFBRTtxQ0FtQmlCLG1CQUFVO0dBbEIzQixTQUFTLENBMklyQjtBQTNJWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAncmVmbGVjdC1tZXRhZGF0YSc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgQW1xcENsaWVudCB9IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7IE5BTUVfS0VZLCBRdWV1ZU9wdGlvbnMsIFB1Ymxpc2hPcHRpb25zLCBTdWJzY3JpYmVPcHRpb25zLCBSZXBseU9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCAqIGFzIGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgKiBhcyBzaG9ydGlkIGZyb20gJ3Nob3J0aWQnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ2luamVjdGlvbi1qcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbXFwUXVldWU8VD4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIHF1ZXVlOiBhbnk7XG4gIHJwY1F1ZXVlOiBhbnk7XG5cbiAgcHJpdmF0ZSBnZXQgb3B0aW9ucygpOiBRdWV1ZU9wdGlvbnMge1xuICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vcHRpb25zID8gXG4gICAgICB0aGlzLl9vcHRpb25zIDogUmVmbGVjdC5nZXRNZXRhZGF0YShOQU1FX0tFWSwgdGhpcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZHVyYWJsZTogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZSxcbiAgICAgIC4uLm9wdHMgXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX29wdGlvbnM6IFF1ZXVlT3B0aW9ucztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNsaWVudDogQW1xcENsaWVudCwgb3B0aW9ucz86IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYob3B0aW9ucykgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5jcmVhdGVRdWV1ZSgpO1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKGNhbGxiYWNrOiAobWVzc2FnZTogVCkgPT4ge30sIG9wdGlvbnM6IFN1YnNjcmliZU9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgY29uc3Qgb3B0czogYW55ID0geyAuLi50aGlzLm9wdGlvbnMsIC4uLm9wdGlvbnMgfTtcblxuICAgIGlmIChvcHRpb25zLnByZWZldGNoKSB7XG4gICAgICBjaG5sLnByZWZldGNoKG9wdGlvbnMucHJlZmV0Y2gpO1xuICAgIH1cblxuICAgIHJldHVybiBjaG5sLmNvbnN1bWUodGhpcy5vcHRpb25zLm5hbWUsIGFzeW5jIChtZXNzYWdlOiBhbXFwLk1lc3NhZ2UpID0+IHtcbiAgICAgIGlmKG9wdHMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBKU09OLnBhcnNlKG1lc3NhZ2UuY29udGVudC50b1N0cmluZygpKTtcbiAgICAgIH1cblxuICAgICAgbWVzc2FnZS5yZXBseSA9IChjb250ZW50OiBhbnksIHJlcGx5T3B0aW9uczogUmVwbHlPcHRpb25zID0ge30pID0+IHtcbiAgICAgICAgcmVwbHlPcHRpb25zLnJlcGx5VG8gPSBtZXNzYWdlLnByb3BlcnRpZXMucmVwbHlUbztcbiAgICAgICAgcmVwbHlPcHRpb25zLmNvcnJlbGF0aW9uSWQgPSBtZXNzYWdlLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZDtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbHkoY29udGVudCwgcmVwbHlPcHRpb25zKTtcbiAgICAgIH07XG5cbiAgICAgIG1lc3NhZ2UuYWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmFjayhtZXNzYWdlKTtcbiAgICAgIH07XG5cbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgIH0sIG9wdHMpO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChjb250ZW50OiBhbnksIG9wdGlvbnM6IFB1Ymxpc2hPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNvbnN0IG9wdHM6IGFueSA9IHsgLi4udGhpcy5vcHRpb25zLCAuLi5vcHRpb25zfTtcblxuICAgIGlmKHRoaXMucnBjUXVldWUpIHtcbiAgICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICBvcHRzLmNvcnJlbGF0aW9uSWQgPSBjb3JyZWxhdGlvbklkO1xuICAgICAgb3B0cy5yZXBseVRvID0gdGhpcy5ycGNRdWV1ZS5xdWV1ZTtcbiAgICB9XG5cbiAgICBpZihvcHRzLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgICAgIGNvbnRlbnQgPSBuZXcgQnVmZmVyKGpzb24pO1xuICAgIH1cblxuICAgIGNobmwuc2VuZFRvUXVldWUodGhpcy5vcHRpb25zLm5hbWUsIGNvbnRlbnQsIG9wdHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQsXG4gICAgICBwcm9wZXJ0aWVzOiBvcHRzXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIHJlcGx5T2YoaWRPck1lc3NhZ2U6IHN0cmluZ3xhbnkpOiBQcm9taXNlPGFtcXAuTWVzc2FnZT4ge1xuICAgIGxldCBpZCA9IGlkT3JNZXNzYWdlO1xuICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGlkID0gaWRPck1lc3NhZ2UucHJvcGVydGllcy5jb3JyZWxhdGlvbklkO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLm9uY2UoaWQsIChtZXNzYWdlOiBhbXFwLk1lc3NhZ2UpID0+IHtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gSlNPTi5wYXJzZShtZXNzYWdlLmNvbnRlbnQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgfSBjYXRjaChlKSB7IC8qIGRvIG5vdGhpbmcgKi8gfVxuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUobWVzc2FnZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHJlcGx5KGNvbnRlbnQ6IGFueSwgb3B0aW9uczogUmVwbHlPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuXG4gICAgaWYodGhpcy5vcHRpb25zLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcbiAgICAgIGNvbnRlbnQgPSBuZXcgQnVmZmVyKGpzb24pO1xuICAgIH1cblxuICAgIGNobmwuc2VuZFRvUXVldWUob3B0aW9ucy5yZXBseVRvLCBjb250ZW50LCBvcHRpb25zKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50LFxuICAgICAgcHJvcGVydGllczogb3B0aW9uc1xuICAgIH07XG4gIH1cblxuICBhc3luYyBhY2sobWVzc2FnZTogYW1xcC5NZXNzYWdlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgY2hubC5hY2sobWVzc2FnZSk7XG4gIH1cblxuICBhc3luYyBwdXJnZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIHJldHVybiBjaG5sLnB1cmdlUXVldWUodGhpcy5vcHRpb25zLm5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVRdWV1ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaGFubmVsID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUodGhpcy5vcHRpb25zLm5hbWUsIHRoaXMub3B0aW9ucyk7XG5cbiAgICBhd2FpdCB0aGlzLmNvbnN1bWVSZXBsaWVzKCk7XG4gICAgXG4gICAgcmV0dXJuIHF1ZXVlO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjb25zdW1lUmVwbGllcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZighdGhpcy5vcHRpb25zLnJwYykgcmV0dXJuO1xuXG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgdGhpcy5ycGNRdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUoJycsIHsgZXhjbHVzaXZlOiB0cnVlIH0pO1xuICAgIFxuICAgIGNobmwuY29uc3VtZSh0aGlzLnJwY1F1ZXVlLnF1ZXVlLCAocmVzdWx0KSA9PiB7XG4gICAgICB0aGlzLmVtaXQocmVzdWx0LnByb3BlcnRpZXMuY29ycmVsYXRpb25JZCwgcmVzdWx0KTtcbiAgICB9LCB7IG5vQWNrOiB0cnVlIH0pO1xuICB9XG4gIFxufVxuIl19