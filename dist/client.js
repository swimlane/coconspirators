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
            return this.connection;
        });
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.disconnect();
            return this.connect();
        });
    }
    disconnect() {
        return this.connection.close();
    }
    subscribe(name, callback, ...middlewares) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = yield this.queue(name);
            return queue.subscribe(callback);
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
    replyOf(name, correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const replyName = `${name}_reply`;
            const queue = yield this.queue(replyName);
            return new Promise((resolve) => {
                queue.subscribe((msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        resolve(msg);
                    }
                }, { noAck: true });
            });
        });
    }
    queue(name, options = {}, ...middlewares) {
        if (!this.queues[name]) {
            this.queues[name] = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const conn = yield this.connection;
                const chnl = yield this.channel;
                const queue = new queue_1.Queue(chnl, name, options, ...middlewares);
                yield queue.initialize();
                if (options.reply) {
                    const replyName = `${name}_reply`;
                    const replyQueue = new queue_1.Queue(chnl, '', { exclusive: true }, ...middlewares);
                    yield replyQueue.initialize();
                    this.queue[replyName] = replyQueue;
                }
                resolve(queue);
            }));
        }
        return this.queues[name];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBc0M7QUFDdEMsZ0NBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSCxZQUFvQixTQUFRLHFCQUFZO0lBWXRDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBVFYsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQVdmLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLEdBQUcsRUFBRSx1QkFBdUI7U0FDN0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLENBQUM7SUFDSCxDQUFDO0lBaEJELElBQUksTUFBTTtRQUNSLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQWVLLE9BQU87O1lBQ1gsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUUzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMs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LENBQUMsOEJBQThCLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFaEUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRWEsYUFBYSxDQUFDLFVBQVU7O1lBQ3BDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQUE7Q0FFRjtBQXBJRCx3QkFvSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnLi9xdWV1ZSc7XG5cbi8qKlxuICogUmFiYml0TVEgQ2xpZW50XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBSYWJiaXRcbiAqIEBleHRlbmRzIHtFdmVudEVtaXR0ZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBSYWJiaXQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNoYW5uZWw6IGFueTtcbiAgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uO1xuICBxdWV1ZXM6IGFueSA9IHt9O1xuICBvcHRpb25zOiBhbnk7XG5cbiAgZ2V0IGxvZ2dlcigpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMubG9nZ2VyKSByZXR1cm4gdGhpcy5vcHRpb25zLmxvZ2dlcjtcbiAgICByZXR1cm4gY29uc29sZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgY29ubmVjdEltbWVkaWF0ZWx5OiB0cnVlLCBcbiAgICAgIHVybDogJ2FtcXA6Ly9sb2NhbGhvc3Q6NTY3MidcbiAgICB9LCBvcHRpb25zKTtcbiAgICBcbiAgICBpZih0aGlzLm9wdGlvbnMuY29ubmVjdEltbWVkaWF0ZWx5KSB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSB0aGlzLmNvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjb25uZWN0KCkge1xuICAgIGlmKHRoaXMuY29ubmVjdGlvbikgcmV0dXJuIHRoaXMuY29ubmVjdGlvbjtcblxuICAgIGNvbnN0IGNvbm5lY3Rpb25TdHIgPSB0aGlzLm9wdGlvbnMudXJsO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlQ29ubmVjdGlvbihjb25uZWN0aW9uU3RyKTtcbiAgICB0aGlzLmNoYW5uZWwgPSBhd2FpdCB0aGlzLmNyZWF0ZUNoYW5uZWwodGhpcy5jb25uZWN0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyByZWNvbm5lY3QoKSB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCgpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCk7XG4gIH1cblxuICBhc3luYyBzdWJzY3JpYmUobmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIC4uLm1pZGRsZXdhcmVzOiBGdW5jdGlvbltdKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS5zdWJzY3JpYmUoY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgcHVyZ2UobmFtZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZXMobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1cmdlKCk7XG4gIH1cblxuICBhc3luYyB1bnN1YnNjcmliZShuYW1lKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlcyhuYW1lKTtcbiAgICByZXR1cm4gcXVldWUudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2gobmFtZTogc3RyaW5nLCBtZXNzYWdlOiBhbnksIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlKG5hbWUpO1xuICAgIHRoaXMubG9nZ2VyLmluZm8oYFJhYmJpdDogU2VuZGluZyBtZXNzYWdlIHRvIHF1ZXVlICR7bmFtZX1gLCBtZXNzYWdlKTtcbiAgICByZXR1cm4gcXVldWUucHVibGlzaChtZXNzYWdlLCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHJlcGx5T2YobmFtZTogc3RyaW5nLCBjb3JyZWxhdGlvbklkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlcGx5TmFtZSA9IGAke25hbWV9X3JlcGx5YDtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUocmVwbHlOYW1lKTtcbiAgICBcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHF1ZXVlLnN1YnNjcmliZSgobXNnKSA9PiB7XG4gICAgICAgIGlmKG1zZy5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQgPT09IGNvcnJlbGF0aW9uSWQpIHtcbiAgICAgICAgICByZXNvbHZlKG1zZyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG4gICAgfSk7XG4gIH1cblxuICBxdWV1ZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9LCAuLi5taWRkbGV3YXJlczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmKCF0aGlzLnF1ZXVlc1tuYW1lXSkge1xuICAgICAgdGhpcy5xdWV1ZXNbbmFtZV0gPSBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgY29ubiA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcbiAgICAgICAgY29uc3QgcXVldWUgPSBuZXcgUXVldWUoY2hubCwgbmFtZSwgb3B0aW9ucywgLi4ubWlkZGxld2FyZXMpO1xuICAgICAgICBhd2FpdCBxdWV1ZS5pbml0aWFsaXplKCk7XG5cbiAgICAgICAgaWYob3B0aW9ucy5yZXBseSkge1xuICAgICAgICAgIGNvbnN0IHJlcGx5TmFtZSA9IGAke25hbWV9X3JlcGx5YDtcbiAgICAgICAgICBjb25zdCByZXBseVF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsICcnLCB7IGV4Y2x1c2l2ZTogdHJ1ZSB9LCAuLi5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgYXdhaXQgcmVwbHlRdWV1ZS5pbml0aWFsaXplKCk7XG4gICAgICAgICAgdGhpcy5xdWV1ZVtyZXBseU5hbWVdID0gcmVwbHlRdWV1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocXVldWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucXVldWVzW25hbWVdO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDb25uZWN0aW9uKGNvbm5lY3Rpb25TdHI6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBhbXFwLmNvbm5lY3QoY29ubmVjdGlvblN0cik7XG5cbiAgICBjb25uZWN0aW9uLm9uY2UoJ2Nsb3NlJywgKGVycikgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIud2FybignUmFiYml0OiBDb25uZWN0aW9uIGNsb3NlZCcsIGVycik7XG4gICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgfSk7XG5cbiAgICBjb25uZWN0aW9uLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdSYWJiaXQ6IENoYW5uZWwgY29ubmVjdGlvbiBlcnJvcicsIGVycik7XG4gICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvZ2dlci5pbmZvKGBSYWJiaXQ6IENvbm5lY3Rpb24gb3BlbmVkOiAke2Nvbm5lY3Rpb25TdHJ9YCk7XG5cbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICBjb25uZWN0aW9uLmNsb3NlKCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybignUmFiYml0OiBDb25uZWN0aW9uIGNsb3NlZCB0aHJvdWdoIGFwcCB0ZXJtaW5hdGlvbicpO1xuICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDaGFubmVsKGNvbm5lY3Rpb24pIHtcbiAgICBjb25zdCBjaGFubmVsID0gY29ubmVjdGlvbi5jcmVhdGVDb25maXJtQ2hhbm5lbCgpO1xuICAgIHRoaXMuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgcmV0dXJuIGNoYW5uZWw7XG4gIH1cblxufVxuIl19