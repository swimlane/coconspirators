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
            return queue.subscribe(name, callback);
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
                queue.subscribe(replyName, (msg) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBc0M7QUFDdEMsZ0NBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSCxZQUFvQixTQUFRLHFCQUFZO0lBWXRDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBVFYsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQVdmLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLEdBQUcsRUFBRSx1QkFBdUI7U0FDN0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLENBQUM7SUFDSCxDQUFDO0lBaEJELElBQUksTUFBTTtRQUNSLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQWVLLE9BQU87O1lBQ1gsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUUzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMs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LENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUVoRSxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDZixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO29CQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFFYSxhQUFhLENBQUMsVUFBVTs7WUFDcEMsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7S0FBQTtDQUVGO0FBcElELHdCQW9JQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0IHsgUXVldWUgfSBmcm9tICcuL3F1ZXVlJztcblxuLyoqXG4gKiBSYWJiaXRNUSBDbGllbnRcbiAqIFxuICogQGV4cG9ydFxuICogQGNsYXNzIFJhYmJpdFxuICogQGV4dGVuZHMge0V2ZW50RW1pdHRlcn1cbiAqL1xuZXhwb3J0IGNsYXNzIFJhYmJpdCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY2hhbm5lbDogYW55O1xuICBjb25uZWN0aW9uOiBhbXFwLkNvbm5lY3Rpb247XG4gIHF1ZXVlczogYW55ID0ge307XG4gIG9wdGlvbnM6IGFueTtcblxuICBnZXQgbG9nZ2VyKCkge1xuICAgIGlmKHRoaXMub3B0aW9ucy5sb2dnZXIpIHJldHVybiB0aGlzLm9wdGlvbnMubG9nZ2VyO1xuICAgIHJldHVybiBjb25zb2xlO1xuICB9XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogYW55ID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBjb25uZWN0SW1tZWRpYXRlbHk6IHRydWUsIFxuICAgICAgdXJsOiAnYW1xcDovL2xvY2FsaG9zdDo1NjcyJ1xuICAgIH0sIG9wdGlvbnMpO1xuICAgIFxuICAgIGlmKHRoaXMub3B0aW9ucy5jb25uZWN0SW1tZWRpYXRlbHkpIHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9IHRoaXMuY29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3QoKSB7XG4gICAgaWYodGhpcy5jb25uZWN0aW9uKSByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuXG4gICAgY29uc3QgY29ubmVjdGlvblN0ciA9IHRoaXMub3B0aW9ucy51cmw7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVDb25uZWN0aW9uKGNvbm5lY3Rpb25TdHIpO1xuICAgIHRoaXMuY2hhbm5lbCA9IGF3YWl0IHRoaXMuY3JlYXRlQ2hhbm5lbCh0aGlzLmNvbm5lY3Rpb24pO1xuXG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbjtcbiAgfVxuXG4gIGFzeW5jIHJlY29ubmVjdCgpIHtcbiAgICBhd2FpdCB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0KCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgfVxuXG4gIGFzeW5jIHN1YnNjcmliZShuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbiwgLi4ubWlkZGxld2FyZXM6IEZ1bmN0aW9uW10pIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnN1YnNjcmliZShuYW1lLCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBwdXJnZShuYW1lKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlcyhuYW1lKTtcbiAgICByZXR1cm4gcXVldWUucHVyZ2UoKTtcbiAgfVxuXG4gIGFzeW5jIHVuc3Vic2NyaWJlKG5hbWUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWVzKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChuYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IGFueSwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUobmFtZSk7XG4gICAgdGhpcy5sb2dnZXIuaW5mbyhgUmFiYml0OiBTZW5kaW5nIG1lc3NhZ2UgdG8gcXVldWUgJHtuYW1lfWAsIG1lc3NhZ2UpO1xuICAgIHJldHVybiBxdWV1ZS5wdWJsaXNoKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgcmVwbHlPZihuYW1lOiBzdHJpbmcsIGNvcnJlbGF0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVwbHlOYW1lID0gYCR7bmFtZX1fcmVwbHlgO1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShyZXBseU5hbWUpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgcXVldWUuc3Vic2NyaWJlKHJlcGx5TmFtZSwgKG1zZykgPT4ge1xuICAgICAgICBpZihtc2cucHJvcGVydGllcy5jb3JyZWxhdGlvbklkID09PSBjb3JyZWxhdGlvbklkKSB7XG4gICAgICAgICAgcmVzb2x2ZShtc2cpO1xuICAgICAgICB9XG4gICAgICB9LCB7IG5vQWNrOiB0cnVlIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcXVldWUobmFtZTogc3RyaW5nLCBvcHRpb25zOiBhbnkgPSB7fSwgLi4ubWlkZGxld2FyZXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZighdGhpcy5xdWV1ZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMucXVldWVzW25hbWVdID0gbmV3IFByb21pc2UoYXN5bmMgcmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgICAgIGNvbnN0IGNobmwgPSBhd2FpdCB0aGlzLmNoYW5uZWw7XG4gICAgICAgIGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsIG5hbWUsIG9wdGlvbnMsIC4uLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgYXdhaXQgcXVldWUuaW5pdGlhbGl6ZSgpO1xuXG4gICAgICAgIGlmKG9wdGlvbnMucmVwbHkpIHtcbiAgICAgICAgICBjb25zdCByZXBseU5hbWUgPSBgJHtuYW1lfV9yZXBseWA7XG4gICAgICAgICAgY29uc3QgcmVwbHlRdWV1ZSA9IG5ldyBRdWV1ZShjaG5sLCAnJywgeyBleGNsdXNpdmU6IHRydWUgfSwgLi4ubWlkZGxld2FyZXMpO1xuICAgICAgICAgIGF3YWl0IHJlcGx5UXVldWUuaW5pdGlhbGl6ZSgpO1xuICAgICAgICAgIHRoaXMucXVldWVbcmVwbHlOYW1lXSA9IHJlcGx5UXVldWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHF1ZXVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnF1ZXVlc1tuYW1lXTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlQ29ubmVjdGlvbihjb25uZWN0aW9uU3RyOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgYW1xcC5jb25uZWN0KGNvbm5lY3Rpb25TdHIpO1xuXG4gICAgY29ubmVjdGlvbi5vbmNlKCdjbG9zZScsIChlcnIpID0+IHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ1JhYmJpdDogQ29ubmVjdGlvbiBjbG9zZWQnLCBlcnIpO1xuICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgIH0pO1xuXG4gICAgY29ubmVjdGlvbi5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcignUmFiYml0OiBDaGFubmVsIGNvbm5lY3Rpb24gZXJyb3InLCBlcnIpO1xuICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2dnZXIuaW5mbyhgUmFiYml0OiBDb25uZWN0aW9uIG9wZW5lZDogJHtjb25uZWN0aW9uU3RyfWApO1xuXG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgY29ubmVjdGlvbi5jbG9zZSgoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ1JhYmJpdDogQ29ubmVjdGlvbiBjbG9zZWQgdGhyb3VnaCBhcHAgdGVybWluYXRpb24nKTtcbiAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlQ2hhbm5lbChjb25uZWN0aW9uKSB7XG4gICAgY29uc3QgY2hhbm5lbCA9IGNvbm5lY3Rpb24uY3JlYXRlQ29uZmlybUNoYW5uZWwoKTtcbiAgICB0aGlzLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuICAgIHJldHVybiBjaGFubmVsO1xuICB9XG5cbn1cbiJdfQ==