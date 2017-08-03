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
};
AmqpQueue = __decorate([
    injection_js_1.Injectable(),
    __metadata("design:paramtypes", [client_1.AmqpClient, Object])
], AmqpQueue);
exports.AmqpQueue = AmqpQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRCQUEwQjtBQUMxQixtQ0FBc0M7QUFDdEMscUNBQXNDO0FBQ3RDLG1DQUFpRztBQUVqRyxtQ0FBbUM7QUFDbkMsK0NBQTBDO0FBRzFDLElBQWEsU0FBUyxHQUF0QixlQUEwQixTQUFRLHFCQUFZO0lBa0I1QyxZQUFvQixNQUFrQixFQUFFLE9BQWE7UUFDbkQsS0FBSyxFQUFFLENBQUM7UUFEVSxXQUFNLEdBQU4sTUFBTSxDQUFZO1FBRXBDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQztZQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFqQkQsSUFBWSxPQUFPO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXRELE1BQU0saUJBQ0osT0FBTyxFQUFFLEtBQUssRUFDZCxLQUFLLEVBQUUsSUFBSSxJQUNSLElBQUksRUFDUDtJQUNKLENBQUM7SUFVSyxTQUFTLENBQUMsUUFBNEIsRUFBRSxVQUE0QixFQUFFOztZQUMxRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxxQkFBYSxJQUFJLENBQUMsT0FBTyxFQUFLLE9BQU8sQ0FBRSxDQUFDO1lBRWxELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsQyxD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LFNBQVM7SUFEckIseUJBQVUsRUFBRTtxQ0FtQmlCLG1CQUFVO0dBbEIzQixTQUFTLENBZ0pyQjtBQWhKWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAncmVmbGVjdC1tZXRhZGF0YSc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgQW1xcENsaWVudCB9IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7IE5BTUVfS0VZLCBRdWV1ZU9wdGlvbnMsIFB1Ymxpc2hPcHRpb25zLCBTdWJzY3JpYmVPcHRpb25zLCBSZXBseU9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCAqIGFzIGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgKiBhcyBzaG9ydGlkIGZyb20gJ3Nob3J0aWQnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ2luamVjdGlvbi1qcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbXFwUXVldWU8VD4gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIHF1ZXVlOiBhbnk7XG4gIHJwY1F1ZXVlOiBhbnk7XG5cbiAgcHJpdmF0ZSBnZXQgb3B0aW9ucygpOiBRdWV1ZU9wdGlvbnMge1xuICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vcHRpb25zID8gXG4gICAgICB0aGlzLl9vcHRpb25zIDogUmVmbGVjdC5nZXRNZXRhZGF0YShOQU1FX0tFWSwgdGhpcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZHVyYWJsZTogZmFsc2UsXG4gICAgICBub0FjazogdHJ1ZSxcbiAgICAgIC4uLm9wdHMgXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX29wdGlvbnM6IFF1ZXVlT3B0aW9ucztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNsaWVudDogQW1xcENsaWVudCwgb3B0aW9ucz86IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYob3B0aW9ucykgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5xdWV1ZSA9IHRoaXMuY3JlYXRlUXVldWUoKTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShjYWxsYmFjazogKG1lc3NhZ2U6IFQpID0+IHt9LCBvcHRpb25zOiBTdWJzY3JpYmVPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNvbnN0IG9wdHM6IGFueSA9IHsgLi4udGhpcy5vcHRpb25zLCAuLi5vcHRpb25zIH07XG5cbiAgICBpZiAob3B0aW9ucy5wcmVmZXRjaCkge1xuICAgICAgY2hubC5wcmVmZXRjaChvcHRpb25zLnByZWZldGNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hubC5jb25zdW1lKHRoaXMub3B0aW9ucy5uYW1lLCBhc3luYyAobWVzc2FnZTogYW1xcC5NZXNzYWdlKSA9PiB7XG4gICAgICBpZihvcHRzLmNvbnRlbnRUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gSlNPTi5wYXJzZShtZXNzYWdlLmNvbnRlbnQudG9TdHJpbmcoKSk7XG4gICAgICB9XG5cbiAgICAgIG1lc3NhZ2UucmVwbHkgPSAoY29udGVudDogYW55LCByZXBseU9wdGlvbnM6IFJlcGx5T3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgICAgIHJlcGx5T3B0aW9ucy5yZXBseVRvID0gbWVzc2FnZS5wcm9wZXJ0aWVzLnJlcGx5VG87XG4gICAgICAgIHJlcGx5T3B0aW9ucy5jb3JyZWxhdGlvbklkID0gbWVzc2FnZS5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQ7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcGx5KGNvbnRlbnQsIHJlcGx5T3B0aW9ucyk7XG4gICAgICB9O1xuXG4gICAgICBtZXNzYWdlLmFjayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5hY2sobWVzc2FnZSk7XG4gICAgICB9O1xuXG4gICAgICBjYWxsYmFjayhtZXNzYWdlKTtcbiAgICB9LCBvcHRzKTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2goY29udGVudDogYW55LCBvcHRpb25zOiBQdWJsaXNoT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjb25zdCBvcHRzOiBhbnkgPSB7IC4uLnRoaXMub3B0aW9ucywgLi4ub3B0aW9uc307XG5cbiAgICBpZih0aGlzLnJwY1F1ZXVlKSB7XG4gICAgICBjb25zdCBjb3JyZWxhdGlvbklkID0gc2hvcnRpZC5nZW5lcmF0ZSgpO1xuICAgICAgb3B0cy5jb3JyZWxhdGlvbklkID0gY29ycmVsYXRpb25JZDtcbiAgICAgIG9wdHMucmVwbHlUbyA9IHRoaXMucnBjUXVldWUucXVldWU7XG4gICAgfVxuXG4gICAgaWYob3B0cy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gICAgICBjb250ZW50ID0gbmV3IEJ1ZmZlcihqc29uKTtcbiAgICB9XG5cbiAgICBjaG5sLnNlbmRUb1F1ZXVlKHRoaXMub3B0aW9ucy5uYW1lLCBjb250ZW50LCBvcHRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50LFxuICAgICAgcHJvcGVydGllczogb3B0c1xuICAgIH07XG4gIH1cblxuICBhc3luYyByZXBseU9mKGlkT3JNZXNzYWdlOiBzdHJpbmd8YW55KTogUHJvbWlzZTxhbXFwLk1lc3NhZ2U+IHtcbiAgICBsZXQgaWQgPSBpZE9yTWVzc2FnZTtcbiAgICBpZih0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICBpZCA9IGlkT3JNZXNzYWdlLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5vbmNlKGlkLCAobWVzc2FnZTogYW1xcC5NZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1lc3NhZ2UuY29udGVudCA9IEpTT04ucGFyc2UobWVzc2FnZS5jb250ZW50LnRvU3RyaW5nKCkpO1xuICAgICAgICAgIH0gY2F0Y2goZSkgeyAvKiBkbyBub3RoaW5nICovIH1cbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKG1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyByZXBseShjb250ZW50OiBhbnksIG9wdGlvbnM6IFJlcGx5T3B0aW9ucyA9IHt9KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcblxuICAgIGlmKHRoaXMub3B0aW9ucy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XG4gICAgICBjb250ZW50ID0gbmV3IEJ1ZmZlcihqc29uKTtcbiAgICB9XG5cbiAgICBjaG5sLnNlbmRUb1F1ZXVlKG9wdGlvbnMucmVwbHlUbywgY29udGVudCwgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudCxcbiAgICAgIHByb3BlcnRpZXM6IG9wdGlvbnNcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgYWNrKG1lc3NhZ2U6IGFtcXAuTWVzc2FnZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNobmwuYWNrKG1lc3NhZ2UpO1xuICB9XG5cbiAgYXN5bmMgcHVyZ2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICByZXR1cm4gY2hubC5wdXJnZVF1ZXVlKHRoaXMub3B0aW9ucy5uYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUXVldWUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29ubiA9IGF3YWl0IHRoaXMuY2xpZW50LmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgICAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUodGhpcy5vcHRpb25zLm5hbWUsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5jb25zdW1lUmVwbGllcygpO1xuICAgICAgICByZXNvbHZlKHF1ZXVlKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNvbnN1bWVSZXBsaWVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmKCF0aGlzLm9wdGlvbnMucnBjKSByZXR1cm47XG5cbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICB0aGlzLnJwY1F1ZXVlID0gYXdhaXQgY2hubC5hc3NlcnRRdWV1ZSgnJywgeyBleGNsdXNpdmU6IHRydWUgfSk7XG4gICAgXG4gICAgY2hubC5jb25zdW1lKHRoaXMucnBjUXVldWUucXVldWUsIChyZXN1bHQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChyZXN1bHQucHJvcGVydGllcy5jb3JyZWxhdGlvbklkLCByZXN1bHQpO1xuICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG4gIH1cbiAgXG59XG4iXX0=