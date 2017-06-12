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
const retry = require("retry");
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
        const operation = retry.operation();
        return new Promise((resolve, reject) => {
            operation.attempt((attempt) => __awaiter(this, void 0, void 0, function* () {
                try {
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
                    resolve(connection);
                }
                catch (e) {
                    if (operation.retry(e))
                        return;
                    reject(e);
                }
            }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IsbUNBQWdDO0FBRWhDOzs7Ozs7R0FNRztBQUNILFlBQW9CLFNBQVEscUJBQVk7SUFRdEMsWUFBWSxVQUFlLEVBQUU7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFMVixXQUFNLEdBQVEsRUFBRSxDQUFDO1FBRWpCLGdCQUFXLEdBQVUsRUFBRSxDQUFDO1FBS3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixHQUFHLEVBQUUsdUJBQXVCO1NBQzdCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDZCxDQUFDO0lBRUssT0FBTzs7WUFDWCxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBRTNDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRXpELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLENBQUMsTUFBTTtnQkFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRCxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVwQixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztR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QUMsQ0FBQzs0QkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbEIsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBRUgsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QixDQUFDO2dCQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1YsRUFBRSxDQUFBLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFBQyxNQUFNLENBQUM7b0JBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWixDQUFDO1lBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVhLGFBQWEsQ0FBQyxVQUFVOztZQUNwQyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQztLQUFBO0NBRUY7QUF4SUQsd0JBd0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCAqIGFzIGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgKiBhcyByZXRyeSBmcm9tICdyZXRyeSc7XG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJy4vcXVldWUnO1xuXG4vKipcbiAqIFJhYmJpdE1RIENsaWVudFxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmFiYml0XG4gKiBAZXh0ZW5kcyB7RXZlbnRFbWl0dGVyfVxuICovXG5leHBvcnQgY2xhc3MgUmFiYml0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjaGFubmVsOiBhbnk7XG4gIGNvbm5lY3Rpb246IGFtcXAuQ29ubmVjdGlvbjtcbiAgcXVldWVzOiBhbnkgPSB7fTtcbiAgb3B0aW9uczogYW55O1xuICBtaWRkbGV3YXJlczogYW55W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIHVybDogJ2FtcXA6Ly9sb2NhbGhvc3Q6NTY3MidcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoKSB7XG4gICAgaWYodGhpcy5jb25uZWN0aW9uKSByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuXG4gICAgY29uc3QgY29ubmVjdGlvblN0ciA9IHRoaXMub3B0aW9ucy51cmw7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVDb25uZWN0aW9uKGNvbm5lY3Rpb25TdHIpO1xuICAgIHRoaXMuY2hhbm5lbCA9IGF3YWl0IHRoaXMuY3JlYXRlQ2hhbm5lbCh0aGlzLmNvbm5lY3Rpb24pO1xuXG4gICAgdGhpcy5jaGFubmVsLmNvbnN1bWUoJ2FtcS5yYWJiaXRtcS5yZXBseS10bycsIChyZXN1bHQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChyZXN1bHQucHJvcGVydGllcy5jb3JyZWxhdGlvbklkLCByZXN1bHQpO1xuICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCkge1xuICAgIGF3YWl0IHRoaXMuZGlzY29ubmVjdCgpO1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuXG4gIHVzZShtaWRkbGV3YXJlOiBhbnkpIHtcbiAgICB0aGlzLm1pZGRsZXdhcmVzLnB1c2gobWlkZGxld2FyZSk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbiwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnN1YnNjcmliZShjYWxsYmFjaywgb3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBwdXJnZShuYW1lKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlcyhuYW1lKTtcbiAgICByZXR1cm4gcXVldWUucHVyZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIHVuc3Vic2NyaWJlKG5hbWUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWVzKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChuYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IGFueSwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1Ymxpc2gobWVzc2FnZSwgb3B0aW9ucyk7XG4gIH1cblxuICBxdWV1ZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9LCAgLi4ubWlkZGxld2FyZXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZighdGhpcy5xdWV1ZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMucXVldWVzW25hbWVdID0gbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAgICAgY29uc3QgbXcgPSB0aGlzLm1pZGRsZXdhcmVzO1xuICAgICAgICBpZihtaWRkbGV3YXJlcykgbXcuY29uY2F0KG1pZGRsZXdhcmVzKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsIG5hbWUsIG9wdGlvbnMsIC4uLm13KTtcbiAgICAgICAgYXdhaXQgcXVldWUuaW5pdGlhbGl6ZSgpO1xuICAgICAgICBcbiAgICAgICAgcmVzb2x2ZShxdWV1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5xdWV1ZXNbbmFtZV07XG4gIH1cblxuICBhc3luYyByZXBseU9mKGNvcnJlbGF0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cbiAgICAgIHRoaXMub25jZShjb3JyZWxhdGlvbklkLCBhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcuc3Vic2NyaWJlKSByZXNwb25zZSA9IGF3YWl0IG13LnN1YnNjcmliZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh7IG1lc3NhZ2UsIHJlc3BvbnNlIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cjogc3RyaW5nKSB7XG4gICAgY29uc3Qgb3BlcmF0aW9uID0gcmV0cnkub3BlcmF0aW9uKCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgb3BlcmF0aW9uLmF0dGVtcHQoYXN5bmMgKGF0dGVtcHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgYW1xcC5jb25uZWN0KGNvbm5lY3Rpb25TdHIpO1xuICAgICAgICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25uZWN0aW9uLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICAgICAgY29ubmVjdGlvbi5jbG9zZSgoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmVzb2x2ZShjb25uZWN0aW9uKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgaWYob3BlcmF0aW9uLnJldHJ5KGUpKSByZXR1cm47XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlQ2hhbm5lbChjb25uZWN0aW9uKSB7XG4gICAgY29uc3QgY2hhbm5lbCA9IGNvbm5lY3Rpb24uY3JlYXRlQ29uZmlybUNoYW5uZWwoKTtcbiAgICB0aGlzLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuICAgIHJldHVybiBjaGFubmVsO1xuICB9XG5cbn1cbiJdfQ==