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
            this.queue = new Promise((resolve, reject) => {
                this.client.once('connected', () => __awaiter(this, void 0, void 0, function* () {
                    const chnl = yield this.client.channel;
                    const queue = yield chnl.assertQueue(this.options.name, this.options);
                    yield this.consumeReplies();
                    resolve(queue);
                }));
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRCQUEwQjtBQUMxQixtQ0FBc0M7QUFDdEMscUNBQXNDO0FBQ3RDLG1DQUFpRztBQUVqRyxtQ0FBbUM7QUFDbkMsK0NBQTBDO0FBRzFDLElBQWEsU0FBUyxHQUF0QixlQUEwQixTQUFRLHFCQUFZO0lBa0I1QyxZQUFvQixNQUFrQixFQUFFLE9BQWE7UUFDbkQsS0FBSyxFQUFFLENBQUM7UUFEVSxXQUFNLEdBQU4sTUFBTSxDQUFZO1FBRXBDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQztZQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBakJELElBQVksT0FBTztRQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUTtZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0RCxNQUFNLGlCQUNKLE9BQU8sRUFBRSxLQUFLLEVBQ2QsS0FBSyxFQUFFLElBQUksSUFDUixJQUFJLEVBQ1A7SUFDSixDQUFDO0lBVUssU0FBUyxDQUFDLFFBQTRCLEVBQUUsVUFBNEIsRUFBRTs7WUFDMUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxNQUFNLElBQUkscUJBQTBCLElBQUksQ0FBQyxPQUFPLEVBQUssT0FBTyxDQUFFLENBQUM7WUFFL0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7WUFFRCxNQUFNLENBQUMs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ZmxlY3QtbWV0YWRhdGEnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IEFtcXBDbGllbnQgfSBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQgeyBOQU1FX0tFWSwgUXVldWVPcHRpb25zLCBQdWJsaXNoT3B0aW9ucywgU3Vic2NyaWJlT3B0aW9ucywgUmVwbHlPcHRpb25zIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgKiBhcyBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0ICogYXMgc2hvcnRpZCBmcm9tICdzaG9ydGlkJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdpbmplY3Rpb24tanMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW1xcFF1ZXVlPFQ+IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBxdWV1ZTogYW55O1xuICBycGNRdWV1ZTogYW55O1xuXG4gIHByaXZhdGUgZ2V0IG9wdGlvbnMoKTogUXVldWVPcHRpb25zIHtcbiAgICBjb25zdCBvcHRzID0gdGhpcy5fb3B0aW9ucyA/IFxuICAgICAgdGhpcy5fb3B0aW9ucyA6IFJlZmxlY3QuZ2V0TWV0YWRhdGEoTkFNRV9LRVksIHRoaXMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGR1cmFibGU6IGZhbHNlLFxuICAgICAgbm9BY2s6IHRydWUsXG4gICAgICAuLi5vcHRzIFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9vcHRpb25zOiBRdWV1ZU9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjbGllbnQ6IEFtcXBDbGllbnQsIG9wdGlvbnM/OiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmKG9wdGlvbnMpIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuY3JlYXRlUXVldWUoKTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShjYWxsYmFjazogKG1lc3NhZ2U6IFQpID0+IHt9LCBvcHRpb25zOiBTdWJzY3JpYmVPcHRpb25zID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgIGNvbnN0IG9wdHM6IFN1YnNjcmliZU9wdGlvbnMgPSB7IC4uLnRoaXMub3B0aW9ucywgLi4ub3B0aW9ucyB9O1xuXG4gICAgaWYgKG9wdGlvbnMucHJlZmV0Y2gpIHtcbiAgICAgIGNobmwucHJlZmV0Y2gob3B0aW9ucy5wcmVmZXRjaCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNobmwuY29uc3VtZSh0aGlzLm9wdGlvbnMubmFtZSwgYXN5bmMgKG1lc3NhZ2U6IGFtcXAuTWVzc2FnZSkgPT4ge1xuICAgICAgaWYob3B0cy5jb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgICAgIG1lc3NhZ2UuY29udGVudCA9IEpTT04ucGFyc2UobWVzc2FnZS5jb250ZW50LnRvU3RyaW5nKCkpO1xuICAgICAgfVxuXG4gICAgICBtZXNzYWdlLnJlcGx5ID0gKGNvbnRlbnQ6IGFueSwgcmVwbHlPcHRpb25zOiBSZXBseU9wdGlvbnMgPSB7fSkgPT4ge1xuICAgICAgICByZXBseU9wdGlvbnMucmVwbHlUbyA9IG1lc3NhZ2UucHJvcGVydGllcy5yZXBseVRvO1xuICAgICAgICByZXBseU9wdGlvbnMuY29ycmVsYXRpb25JZCA9IG1lc3NhZ2UucHJvcGVydGllcy5jb3JyZWxhdGlvbklkO1xuICAgICAgICByZXR1cm4gdGhpcy5yZXBseShjb250ZW50LCByZXBseU9wdGlvbnMpO1xuICAgICAgfTtcblxuICAgICAgbWVzc2FnZS5hY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuYWNrKG1lc3NhZ2UpO1xuICAgICAgfTtcblxuICAgICAgY2FsbGJhY2sobWVzc2FnZSk7XG4gICAgfSwgb3B0cyk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKGNvbnRlbnQ6IGFueSwgb3B0aW9uczogUHVibGlzaE9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgY29uc3Qgb3B0czogYW55ID0geyAuLi50aGlzLm9wdGlvbnMsIC4uLm9wdGlvbnN9O1xuXG4gICAgaWYodGhpcy5ycGNRdWV1ZSkge1xuICAgICAgY29uc3QgY29ycmVsYXRpb25JZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgIG9wdHMuY29ycmVsYXRpb25JZCA9IGNvcnJlbGF0aW9uSWQ7XG4gICAgICBvcHRzLnJlcGx5VG8gPSB0aGlzLnJwY1F1ZXVlLnF1ZXVlO1xuICAgIH1cblxuICAgIGlmKG9wdHMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICAgICAgY29udGVudCA9IG5ldyBCdWZmZXIoanNvbik7XG4gICAgfVxuXG4gICAgY2hubC5zZW5kVG9RdWV1ZSh0aGlzLm9wdGlvbnMubmFtZSwgY29udGVudCwgb3B0cyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudCxcbiAgICAgIHByb3BlcnRpZXM6IG9wdHNcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcmVwbHlPZihpZE9yTWVzc2FnZTogc3RyaW5nfGFueSk6IFByb21pc2U8YW1xcC5NZXNzYWdlPiB7XG4gICAgbGV0IGlkID0gaWRPck1lc3NhZ2U7XG4gICAgaWYodHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgICAgaWQgPSBpZE9yTWVzc2FnZS5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMub25jZShpZCwgKG1lc3NhZ2U6IGFtcXAuTWVzc2FnZSkgPT4ge1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBKU09OLnBhcnNlKG1lc3NhZ2UuY29udGVudC50b1N0cmluZygpKTtcbiAgICAgICAgICB9IGNhdGNoKGUpIHsgLyogZG8gbm90aGluZyAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZShtZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcmVwbHkoY29udGVudDogYW55LCBvcHRpb25zOiBSZXBseU9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xuICAgICAgY29udGVudCA9IG5ldyBCdWZmZXIoanNvbik7XG4gICAgfVxuXG4gICAgY2hubC5zZW5kVG9RdWV1ZShvcHRpb25zLnJlcGx5VG8sIGNvbnRlbnQsIG9wdGlvbnMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQsXG4gICAgICBwcm9wZXJ0aWVzOiBvcHRpb25zXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGFjayhtZXNzYWdlOiBhbXFwLk1lc3NhZ2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbDtcbiAgICBjaG5sLmFjayhtZXNzYWdlKTtcbiAgfVxuXG4gIGFzeW5jIHB1cmdlKCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgcmV0dXJuIGNobmwucHVyZ2VRdWV1ZSh0aGlzLm9wdGlvbnMubmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZVF1ZXVlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucXVldWUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNsaWVudC5vbmNlKCdjb25uZWN0ZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVsO1xuICAgICAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUodGhpcy5vcHRpb25zLm5hbWUsIHRoaXMub3B0aW9ucyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5jb25zdW1lUmVwbGllcygpO1xuICAgICAgICByZXNvbHZlKHF1ZXVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjb25zdW1lUmVwbGllcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZighdGhpcy5vcHRpb25zLnJwYykgcmV0dXJuO1xuXG4gICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWw7XG4gICAgdGhpcy5ycGNRdWV1ZSA9IGF3YWl0IGNobmwuYXNzZXJ0UXVldWUoJycsIHsgZXhjbHVzaXZlOiB0cnVlIH0pO1xuICAgIFxuICAgIGNobmwuY29uc3VtZSh0aGlzLnJwY1F1ZXVlLnF1ZXVlLCAocmVzdWx0KSA9PiB7XG4gICAgICB0aGlzLmVtaXQocmVzdWx0LnByb3BlcnRpZXMuY29ycmVsYXRpb25JZCwgcmVzdWx0KTtcbiAgICB9LCB7IG5vQWNrOiB0cnVlIH0pO1xuICB9XG4gIFxufVxuIl19