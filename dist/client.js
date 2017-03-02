"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
            connectImmediately: true,
            url: 'amqp://localhost:5672'
        }, options);
        if (this.options.connectImmediately) {
            this.connection = this.connect();
        }
    }
    get logger() {
        if (this.options.logger)
            return this.options.logger;
        return console;
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
            this.logger.info(`Rabbit: Sending message to queue ${name}`, message);
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
                this.logger.warn('Rabbit: Connection closed', err);
                this.emit('disconnected', err);
            });
            connection.on('error', (err) => {
                this.logger.error('Rabbit: Channel connection error', err);
                this.emit('disconnected', err);
            });
            this.logger.info(`Rabbit: Connection opened: ${connectionStr}`);
            process.on('SIGINT', () => {
                connection.close(() => {
                    this.logger.warn('Rabbit: Connection closed through app termination');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBc0M7QUFDdEMsZ0NBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSCxZQUFvQixTQUFRLHFCQUFZO0lBYXRDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBVlYsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQUVqQixnQkFBVyxHQUFVLEVBQUUsQ0FBQztRQVV0QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDM0Isa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixHQUFHLEVBQUUsdUJBQXVCO1NBQzdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFWixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQWhCRCxJQUFJLE1BQU07UUFDUixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFlSyxPQUFPOztZQUNYLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFFM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RCxJQUFJLENB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QUVILFVBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRztnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFaEUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRWEsYUFBYSxDQUFDLFVBQVU7O1lBQ3BDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQUE7Q0FFRjtBQTdJRCx3QkE2SUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnLi9xdWV1ZSc7XG5cbi8qKlxuICogUmFiYml0TVEgQ2xpZW50XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBSYWJiaXRcbiAqIEBleHRlbmRzIHtFdmVudEVtaXR0ZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBSYWJiaXQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNoYW5uZWw6IGFueTtcbiAgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uO1xuICBxdWV1ZXM6IGFueSA9IHt9O1xuICBvcHRpb25zOiBhbnk7XG4gIG1pZGRsZXdhcmVzOiBhbnlbXSA9IFtdO1xuXG4gIGdldCBsb2dnZXIoKSB7XG4gICAgaWYodGhpcy5vcHRpb25zLmxvZ2dlcikgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2dnZXI7XG4gICAgcmV0dXJuIGNvbnNvbGU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGNvbm5lY3RJbW1lZGlhdGVseTogdHJ1ZSwgXG4gICAgICB1cmw6ICdhbXFwOi8vbG9jYWxob3N0OjU2NzInXG4gICAgfSwgb3B0aW9ucyk7XG4gICAgXG4gICAgaWYodGhpcy5vcHRpb25zLmNvbm5lY3RJbW1lZGlhdGVseSkge1xuICAgICAgdGhpcy5jb25uZWN0aW9uID0gdGhpcy5jb25uZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY29ubmVjdCgpIHtcbiAgICBpZih0aGlzLmNvbm5lY3Rpb24pIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG5cbiAgICBjb25zdCBjb25uZWN0aW9uU3RyID0gdGhpcy5vcHRpb25zLnVybDtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cik7XG4gICAgdGhpcy5jaGFubmVsID0gYXdhaXQgdGhpcy5jcmVhdGVDaGFubmVsKHRoaXMuY29ubmVjdGlvbik7XG5cbiAgICB0aGlzLmNoYW5uZWwuY29uc3VtZSgnYW1xLnJhYmJpdG1xLnJlcGx5LXRvJywgKHJlc3VsdCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KHJlc3VsdC5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQsIHJlc3VsdCk7XG4gICAgfSwgeyBub0FjazogdHJ1ZSB9KTtcblxuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyByZWNvbm5lY3QoKSB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCgpO1xuICB9XG5cbiAgdXNlKG1pZGRsZXdhcmU6IGFueSkge1xuICAgIHRoaXMubWlkZGxld2FyZXMucHVzaChtaWRkbGV3YXJlKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbi5jbG9zZSgpO1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShuYW1lKTtcbiAgICByZXR1cm4gcXVldWUuc3Vic2NyaWJlKGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHB1cmdlKG5hbWUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWVzKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS5wdXJnZSgpO1xuICB9XG5cbiAgYXN5bmMgdW5zdWJzY3JpYmUobmFtZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZXMobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKG5hbWU6IHN0cmluZywgbWVzc2FnZTogYW55LCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShuYW1lKTtcbiAgICB0aGlzLmxvZ2dlci5pbmZvKGBSYWJiaXQ6IFNlbmRpbmcgbWVzc2FnZSB0byBxdWV1ZSAke25hbWV9YCwgbWVzc2FnZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1Ymxpc2gobWVzc2FnZSwgb3B0aW9ucyk7XG4gIH1cblxuICBxdWV1ZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9LCAgLi4ubWlkZGxld2FyZXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZighdGhpcy5xdWV1ZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMucXVldWVzW25hbWVdID0gbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAgICAgY29uc3QgbXcgPSB0aGlzLm1pZGRsZXdhcmVzO1xuICAgICAgICBpZihtaWRkbGV3YXJlcykgbXcuY29uY2F0KG1pZGRsZXdhcmVzKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsIG5hbWUsIG9wdGlvbnMsIC4uLm13KTtcbiAgICAgICAgYXdhaXQgcXVldWUuaW5pdGlhbGl6ZSgpO1xuICAgICAgICBcbiAgICAgICAgcmVzb2x2ZShxdWV1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5xdWV1ZXNbbmFtZV07XG4gIH1cblxuICBhc3luYyByZXBseU9mKGNvcnJlbGF0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cbiAgICAgIHRoaXMub25jZShjb3JyZWxhdGlvbklkLCBhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcuc3Vic2NyaWJlKSByZXNwb25zZSA9IGF3YWl0IG13LnN1YnNjcmliZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh7IG1lc3NhZ2UsIHJlc3BvbnNlIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cjogc3RyaW5nKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGFtcXAuY29ubmVjdChjb25uZWN0aW9uU3RyKTtcblxuICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKCdSYWJiaXQ6IENvbm5lY3Rpb24gY2xvc2VkJywgZXJyKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICB9KTtcblxuICAgIGNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1JhYmJpdDogQ2hhbm5lbCBjb25uZWN0aW9uIGVycm9yJywgZXJyKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9nZ2VyLmluZm8oYFJhYmJpdDogQ29ubmVjdGlvbiBvcGVuZWQ6ICR7Y29ubmVjdGlvblN0cn1gKTtcblxuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdSYWJiaXQ6IENvbm5lY3Rpb24gY2xvc2VkIHRocm91Z2ggYXBwIHRlcm1pbmF0aW9uJyk7XG4gICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNoYW5uZWwoY29ubmVjdGlvbikge1xuICAgIGNvbnN0IGNoYW5uZWwgPSBjb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuXG59XG4iXX0=