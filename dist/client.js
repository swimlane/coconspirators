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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBc0M7QUFDdEMsZ0NBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQzs7Ozs7O0dBTUc7QUFDSCxZQUFvQixTQUFRLHFCQUFZO0lBWXRDLFlBQVksVUFBZSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBVFYsV0FBTSxHQUFRLEVBQUUsQ0FBQztRQVdmLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMzQixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLEdBQUcsRUFBRSx1QkFBdUI7U0FDN0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLENBQUM7SUFDSCxDQUFDO0lBaEJELElBQUksTUFBTTtRQUNSLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQWVLLE9BQU87O1lBQ1gsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUUzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMs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LENBQUMsSUFBSSxDQUFDLDhCQUE4QixhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO2dCQUNuQixVQUFVLENBQUMsS0FBSyxDQUFDO29CQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1EQUFtRCxDQUFDLENBQUM7b0JBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUVhLGFBQWEsQ0FBQyxVQUFVOztZQUNwQyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQztLQUFBO0NBRUY7QUFwSUQsd0JBb0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCAqIGFzIGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgeyBRdWV1ZSB9IGZyb20gJy4vcXVldWUnO1xuXG4vKipcbiAqIFJhYmJpdE1RIENsaWVudFxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmFiYml0XG4gKiBAZXh0ZW5kcyB7RXZlbnRFbWl0dGVyfVxuICovXG5leHBvcnQgY2xhc3MgUmFiYml0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICBjaGFubmVsOiBhbnk7XG4gIGNvbm5lY3Rpb246IGFtcXAuQ29ubmVjdGlvbjtcbiAgcXVldWVzOiBhbnkgPSB7fTtcbiAgb3B0aW9uczogYW55O1xuXG4gIGdldCBsb2dnZXIoKSB7XG4gICAgaWYodGhpcy5vcHRpb25zLmxvZ2dlcikgcmV0dXJuIHRoaXMub3B0aW9ucy5sb2dnZXI7XG4gICAgcmV0dXJuIGNvbnNvbGU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGNvbm5lY3RJbW1lZGlhdGVseTogdHJ1ZSwgXG4gICAgICB1cmw6ICdhbXFwOi8vbG9jYWxob3N0OjU2NzInXG4gICAgfSwgb3B0aW9ucyk7XG4gICAgXG4gICAgaWYodGhpcy5vcHRpb25zLmNvbm5lY3RJbW1lZGlhdGVseSkge1xuICAgICAgdGhpcy5jb25uZWN0aW9uID0gdGhpcy5jb25uZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY29ubmVjdCgpIHtcbiAgICBpZih0aGlzLmNvbm5lY3Rpb24pIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG5cbiAgICBjb25zdCBjb25uZWN0aW9uU3RyID0gdGhpcy5vcHRpb25zLnVybDtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cik7XG4gICAgdGhpcy5jaGFubmVsID0gYXdhaXQgdGhpcy5jcmVhdGVDaGFubmVsKHRoaXMuY29ubmVjdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCkge1xuICAgIGF3YWl0IHRoaXMuZGlzY29ubmVjdCgpO1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbi5jbG9zZSgpO1xuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCAuLi5taWRkbGV3YXJlczogRnVuY3Rpb25bXSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShuYW1lKTtcbiAgICByZXR1cm4gcXVldWUuc3Vic2NyaWJlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIHB1cmdlKG5hbWUpIHtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWVzKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS5wdXJnZSgpO1xuICB9XG5cbiAgYXN5bmMgdW5zdWJzY3JpYmUobmFtZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZXMobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKG5hbWU6IHN0cmluZywgbWVzc2FnZTogYW55LCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZShuYW1lKTtcbiAgICB0aGlzLmxvZ2dlci5pbmZvKGBSYWJiaXQ6IFNlbmRpbmcgbWVzc2FnZSB0byBxdWV1ZSAke25hbWV9YCwgbWVzc2FnZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1Ymxpc2gobWVzc2FnZSwgb3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyByZXBseU9mKG5hbWU6IHN0cmluZywgY29ycmVsYXRpb25JZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXBseU5hbWUgPSBgJHtuYW1lfV9yZXBseWA7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlKHJlcGx5TmFtZSk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBxdWV1ZS5zdWJzY3JpYmUocmVwbHlOYW1lLCAobXNnKSA9PiB7XG4gICAgICAgIGlmKG1zZy5wcm9wZXJ0aWVzLmNvcnJlbGF0aW9uSWQgPT09IGNvcnJlbGF0aW9uSWQpIHtcbiAgICAgICAgICByZXNvbHZlKG1zZyk7XG4gICAgICAgIH1cbiAgICAgIH0sIHsgbm9BY2s6IHRydWUgfSk7XG4gICAgfSk7XG4gIH1cblxuICBxdWV1ZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGFueSA9IHt9LCAuLi5taWRkbGV3YXJlczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmKCF0aGlzLnF1ZXVlc1tuYW1lXSkge1xuICAgICAgdGhpcy5xdWV1ZXNbbmFtZV0gPSBuZXcgUHJvbWlzZShhc3luYyByZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgY29ubiA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICAgICAgY29uc3QgY2hubCA9IGF3YWl0IHRoaXMuY2hhbm5lbDtcbiAgICAgICAgY29uc3QgcXVldWUgPSBuZXcgUXVldWUoY2hubCwgbmFtZSwgb3B0aW9ucywgLi4ubWlkZGxld2FyZXMpO1xuICAgICAgICBhd2FpdCBxdWV1ZS5pbml0aWFsaXplKCk7XG5cbiAgICAgICAgaWYob3B0aW9ucy5yZXBseSkge1xuICAgICAgICAgIGNvbnN0IHJlcGx5TmFtZSA9IGAke25hbWV9X3JlcGx5YDtcbiAgICAgICAgICBjb25zdCByZXBseVF1ZXVlID0gbmV3IFF1ZXVlKGNobmwsICcnLCB7IGV4Y2x1c2l2ZTogdHJ1ZSB9LCAuLi5taWRkbGV3YXJlcyk7XG4gICAgICAgICAgYXdhaXQgcmVwbHlRdWV1ZS5pbml0aWFsaXplKCk7XG4gICAgICAgICAgdGhpcy5xdWV1ZVtyZXBseU5hbWVdID0gcmVwbHlRdWV1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocXVldWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucXVldWVzW25hbWVdO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDb25uZWN0aW9uKGNvbm5lY3Rpb25TdHI6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBhbXFwLmNvbm5lY3QoY29ubmVjdGlvblN0cik7XG5cbiAgICBjb25uZWN0aW9uLm9uY2UoJ2Nsb3NlJywgKGVycikgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIud2FybignUmFiYml0OiBDb25uZWN0aW9uIGNsb3NlZCcsIGVycik7XG4gICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgfSk7XG5cbiAgICBjb25uZWN0aW9uLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdSYWJiaXQ6IENoYW5uZWwgY29ubmVjdGlvbiBlcnJvcicsIGVycik7XG4gICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvZ2dlci5pbmZvKGBSYWJiaXQ6IENvbm5lY3Rpb24gb3BlbmVkOiAke2Nvbm5lY3Rpb25TdHJ9YCk7XG5cbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICBjb25uZWN0aW9uLmNsb3NlKCgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybignUmFiYml0OiBDb25uZWN0aW9uIGNsb3NlZCB0aHJvdWdoIGFwcCB0ZXJtaW5hdGlvbicpO1xuICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDaGFubmVsKGNvbm5lY3Rpb24pIHtcbiAgICBjb25zdCBjaGFubmVsID0gY29ubmVjdGlvbi5jcmVhdGVDb25maXJtQ2hhbm5lbCgpO1xuICAgIHRoaXMuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgcmV0dXJuIGNoYW5uZWw7XG4gIH1cblxufVxuIl19