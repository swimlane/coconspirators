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
const events_1 = require("events");
const amqp = require("amqplib");
const queue_1 = require("./queue");
/**
 * RabbitMQ Client
 *
 * @export
 * @class Rabbit
 * @extends {EventEmitter}
 */
class Rabbit extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.queues = {};
        this.middlewares = [];
        this.options = Object.assign({
            url: 'amqp://localhost:5672'
        }, options);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection)
                return this.connection;
            const connectionStr = this.options.url;
            this.connection = yield this.createConnection(connectionStr);
            this.channel = yield this.createChannel(this.connection);
            this.channel.consume('amq.rabbitmq.reply-to', (result) => {
                this.emit(result.properties.correlationId, result);
            }, { noAck: true });
            return this.connection;
        });
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.disconnect();
            return this.connect();
        });
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    disconnect() {
        return this.connection.close();
    }
    subscribe(name, callback, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = yield this.queue(name);
            return queue.subscribe(callback, options);
        });
    }
    purge(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = yield this.queues(name);
            return queue.purge();
        });
    }
    unsubscribe(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = yield this.queues(name);
            return queue.unsubscribe();
        });
    }
    publish(name, message, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = yield this.queue(name);
            return queue.publish(message, options);
        });
    }
    queue(name, options = {}, ...middlewares) {
        if (!this.queues[name]) {
            this.queues[name] = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const conn = yield this.connection;
                const chnl = yield this.channel;
                const mw = this.middlewares;
                if (middlewares)
                    mw.concat(middlewares);
                const queue = new queue_1.Queue(chnl, name, options, ...mw);
                yield queue.initialize();
                resolve(queue);
            }));
        }
        return this.queues[name];
    }
    replyOf(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.once(correlationId, (message) => __awaiter(this, void 0, void 0, function* () {
                    let response = message.content;
                    if (this.middlewares) {
                        for (const mw of this.middlewares) {
                            if (mw.subscribe)
                                response = yield mw.subscribe(response);
                        }
                    }
                    resolve({ message, response });
                }));
            }));
        });
    }
    createConnection(connectionStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield amqp.connect(connectionStr);
            connection.once('close', (err) => {
                this.emit('disconnected', err);
            });
            connection.on('error', (err) => {
                this.emit('error', err);
                this.emit('disconnected', err);
            });
            process.on('SIGINT', () => {
                connection.close(() => {
                    this.emit('disconnected');
                    process.exit(0);
                });
            });
            return connection;
        });
    }
    createChannel(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = connection.createConfirmChannel();
            this.emit('connected');
            return channel;
        });
    }
}
exports.Rabbit = Rabbit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQyxtQ0FBZ0M7QUFFaEM7Ozs7OztHQU1HO0FBQ0gsWUFBb0IsU0FBUSxxQkFBWTtJQVF0QyxZQUFZLFVBQWUsRUFBRTtRQUMzQixLQUFLLEVBQUUsQ0FBQztRQUxWLFdBQU0sR0FBUSxFQUFFLENBQUM7UUFFakIsZ0JBQVcsR0FBVSxFQUFFLENBQUM7UUFLdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzNCLEdBQUcsRUFBRSx1QkFBdUI7U0FDN0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNkLENBQUM7SUFFSyxPQUFPOztZQUNYLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFFM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxNQUFNO2dCQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRXBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pCLENBQUM7S0FB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QU8sR0FBRyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQztLQUFBO0NBRUY7QUE5SEQsd0JBOEhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCAqIGFzIGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJy4vcXVldWUnO1xuXG4vKipcbiAqIFJhYmJpdE1RIENsaWVudFxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmFiYml0XG4gKiBAZXh0ZW5kcyB7RXZlbnRFbWl0dGVyfVxuICovXG5leHBvcnQgY2xhc3MgUmFiYml0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjaGFubmVsOiBhbnk7XG4gIGNvbm5lY3Rpb246IGFtcXAuQ29ubmVjdGlvbjtcbiAgcXVldWVzOiBhbnkgPSB7fTtcbiAgb3B0aW9uczogYW55O1xuICBtaWRkbGV3YXJlczogYW55W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIHVybDogJ2FtcXA6Ly9sb2NhbGhvc3Q6NTY3MidcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoKSB7XG4gICAgaWYodGhpcy5jb25uZWN0aW9uKSByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuXG4gICAgY29uc3QgY29ubmVjdGlvblN0ciA9IHRoaXMub3B0aW9ucy51cmw7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVDb25uZWN0aW9uKGNvbm5lY3Rpb25TdHIpO1xuICAgIHRoaXMuY2hhbm5lbCA9IGF3YWl0IHRoaXMuY3JlYXRlQ2hhbm5lbCh0aGlzLmNvbm5lY3Rpb24pO1xuXG4gICAgdGhpcy5jaGFubmVsLmNvbnN1bWUoJ2FtcS5yYWJiaXRtcS5yZXBseS10bycsIChyZXN1bHQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChyZXN1bHQucHJvcGVydGllcy5jb3JyZWxhdGlvbklkLCByZXN1bHQpO1xuICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCkge1xuICAgIGF3YWl0IHRoaXMuZGlzY29ubmVjdCgpO1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuXG4gIHVzZShtaWRkbGV3YXJlOiBhbnkpIHtcbiAgICB0aGlzLm1pZGRsZXdhcmVzLnB1c2gobWlkZGxld2FyZSk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbiwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnN1YnNjcmliZShjYWxsYmFjaywgb3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwdXJnZShuYW1lKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlcyhuYW1lKTtcbiAgICByZXR1cm4gcXVldWUucHVyZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIHVuc3Vic2NyaWJlKG5hbWUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWVzKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChuYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IGFueSwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1Ymxpc2gobWVzc2FnZSwgb3B0aW9ucyk7XG4gIH1cblxuICBxdWV1ZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9LCAgLi4ubWlkZGxld2FyZXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZighdGhpcy5xdWV1ZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMucXVldWVzW25hbWVdID0gbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAgICAgY29uc3QgbXcgPSB0aGlzLm1pZGRsZXdhcmVzO1xuICAgICAgICBpZihtaWRkbGV3YXJlcykgbXcuY29uY2F0KG1pZGRsZXdhcmVzKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsIG5hbWUsIG9wdGlvbnMsIC4uLm13KTtcbiAgICAgICAgYXdhaXQgcXVldWUuaW5pdGlhbGl6ZSgpO1xuICAgICAgICBcbiAgICAgICAgcmVzb2x2ZShxdWV1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5xdWV1ZXNbbmFtZV07XG4gIH1cblxuICBhc3luYyByZXBseU9mKGNvcnJlbGF0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cbiAgICAgIHRoaXMub25jZShjb3JyZWxhdGlvbklkLCBhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcuc3Vic2NyaWJlKSByZXNwb25zZSA9IGF3YWl0IG13LnN1YnNjcmliZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh7IG1lc3NhZ2UsIHJlc3BvbnNlIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cjogc3RyaW5nKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGFtcXAuY29ubmVjdChjb25uZWN0aW9uU3RyKTtcblxuICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgfSk7XG5cbiAgICBjb25uZWN0aW9uLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgIH0pO1xuXG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgY29ubmVjdGlvbi5jbG9zZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNoYW5uZWwoY29ubmVjdGlvbikge1xuICAgIGNvbnN0IGNoYW5uZWwgPSBjb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuXG59XG4iXX0=