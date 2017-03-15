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
            url: 'amqp://localhost:5672'
        }, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBc0M7QUFDdEMsZ0NBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSCxZQUFvQixTQUFRLHFCQUFZO0lBYXRDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBVlYsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQUVqQixnQkFBVyxHQUFVLEVBQUUsQ0FBQztRQVV0QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDM0IsR0FBRyxFQUFFLHVCQUF1QjtTQUM3QixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQVhELElBQUksTUFBTTtRQUNSLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQVVLLE9BQU87O1lBQ1gsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUUzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUV6RCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLE1BQU07Z0JBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMs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RyxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUVoRSxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDZixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO29CQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFFYSxhQUFhLENBQUMsVUFBVTs7WUFDcEMsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7S0FBQTtDQUVGO0FBeElELHdCQXdJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0IHsgUXVldWUgfSBmcm9tICcuL3F1ZXVlJztcblxuLyoqXG4gKiBSYWJiaXRNUSBDbGllbnRcbiAqIFxuICogQGV4cG9ydFxuICogQGNsYXNzIFJhYmJpdFxuICogQGV4dGVuZHMge0V2ZW50RW1pdHRlcn1cbiAqL1xuZXhwb3J0IGNsYXNzIFJhYmJpdCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY2hhbm5lbDogYW55O1xuICBjb25uZWN0aW9uOiBhbXFwLkNvbm5lY3Rpb247XG4gIHF1ZXVlczogYW55ID0ge307XG4gIG9wdGlvbnM6IGFueTtcbiAgbWlkZGxld2FyZXM6IGFueVtdID0gW107XG5cbiAgZ2V0IGxvZ2dlcigpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMubG9nZ2VyKSByZXR1cm4gdGhpcy5vcHRpb25zLmxvZ2dlcjtcbiAgICByZXR1cm4gY29uc29sZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgdXJsOiAnYW1xcDovL2xvY2FsaG9zdDo1NjcyJ1xuICAgIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgY29ubmVjdCgpIHtcbiAgICBpZih0aGlzLmNvbm5lY3Rpb24pIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG5cbiAgICBjb25zdCBjb25uZWN0aW9uU3RyID0gdGhpcy5vcHRpb25zLnVybDtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cik7XG4gICAgdGhpcy5jaGFubmVsID0gYXdhaXQgdGhpcy5jcmVhdGVDaGFubmVsKHRoaXMuY29ubmVjdGlvbik7XG5cbiAgICB0aGlzLmNoYW5uZWwuY29uc3VtZSgnYW1xLnJhYmJpdG1xLnJlcGx5LXRvJywgKHJlc3VsdCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KHJlc3VsdC5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQsIHJlc3VsdCk7XG4gICAgfSwgeyBub0FjazogdHJ1ZSB9KTtcblxuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyByZWNvbm5lY3QoKSB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCgpO1xuICB9XG5cbiAgdXNlKG1pZGRsZXdhcmU6IGFueSkge1xuICAgIHRoaXMubWlkZGxld2FyZXMucHVzaChtaWRkbGV3YXJlKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbi5jbG9zZSgpO1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShuYW1lKTtcbiAgICByZXR1cm4gcXVldWUuc3Vic2NyaWJlKGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHB1cmdlKG5hbWUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWVzKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS5wdXJnZSgpO1xuICB9XG5cbiAgYXN5bmMgdW5zdWJzY3JpYmUobmFtZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZXMobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKG5hbWU6IHN0cmluZywgbWVzc2FnZTogYW55LCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShuYW1lKTtcbiAgICB0aGlzLmxvZ2dlci5pbmZvKGBSYWJiaXQ6IFNlbmRpbmcgbWVzc2FnZSB0byBxdWV1ZSAke25hbWV9YCwgbWVzc2FnZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1Ymxpc2gobWVzc2FnZSwgb3B0aW9ucyk7XG4gIH1cblxuICBxdWV1ZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9LCAgLi4ubWlkZGxld2FyZXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZighdGhpcy5xdWV1ZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMucXVldWVzW25hbWVdID0gbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG5cbiAgICAgICAgY29uc3QgbXcgPSB0aGlzLm1pZGRsZXdhcmVzO1xuICAgICAgICBpZihtaWRkbGV3YXJlcykgbXcuY29uY2F0KG1pZGRsZXdhcmVzKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsIG5hbWUsIG9wdGlvbnMsIC4uLm13KTtcbiAgICAgICAgYXdhaXQgcXVldWUuaW5pdGlhbGl6ZSgpO1xuICAgICAgICBcbiAgICAgICAgcmVzb2x2ZShxdWV1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5xdWV1ZXNbbmFtZV07XG4gIH1cblxuICBhc3luYyByZXBseU9mKGNvcnJlbGF0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cbiAgICAgIHRoaXMub25jZShjb3JyZWxhdGlvbklkLCBhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgIGlmKHRoaXMubWlkZGxld2FyZXMpIHtcbiAgICAgICAgICBmb3IoY29uc3QgbXcgb2YgdGhpcy5taWRkbGV3YXJlcykge1xuICAgICAgICAgICAgaWYobXcuc3Vic2NyaWJlKSByZXNwb25zZSA9IGF3YWl0IG13LnN1YnNjcmliZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh7IG1lc3NhZ2UsIHJlc3BvbnNlIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cjogc3RyaW5nKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGFtcXAuY29ubmVjdChjb25uZWN0aW9uU3RyKTtcblxuICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKCdSYWJiaXQ6IENvbm5lY3Rpb24gY2xvc2VkJywgZXJyKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICB9KTtcblxuICAgIGNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1JhYmJpdDogQ2hhbm5lbCBjb25uZWN0aW9uIGVycm9yJywgZXJyKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9nZ2VyLmluZm8oYFJhYmJpdDogQ29ubmVjdGlvbiBvcGVuZWQ6ICR7Y29ubmVjdGlvblN0cn1gKTtcblxuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdSYWJiaXQ6IENvbm5lY3Rpb24gY2xvc2VkIHRocm91Z2ggYXBwIHRlcm1pbmF0aW9uJyk7XG4gICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNoYW5uZWwoY29ubmVjdGlvbikge1xuICAgIGNvbnN0IGNoYW5uZWwgPSBjb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuXG59XG4iXX0=