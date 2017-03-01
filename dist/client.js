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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQyxtQ0FBZ0M7QUFFaEM7Ozs7OztHQU1HO0FBQ0gsWUFBb0IsU0FBUSxxQkFBWTtJQVl0QyxZQUFZLFVBQWUsRUFBRTtRQUMzQixLQUFLLEVBQUUsQ0FBQztRQVRWLFdBQU0sR0FBUSxFQUFFLENBQUM7UUFXZixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDM0Isa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixHQUFHLEVBQUUsdUJBQXVCO1NBQzdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFWixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQWhCRCxJQUFJLE1BQU07UUFDUixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFlSyxPQUFPOztZQUNYLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFFM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFD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SSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFaEUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUMsQ0FBQztvQkFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRWEsYUFBYSxDQUFDLFVBQVU7O1lBQ3BDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQUE7Q0FFRjtBQXBJRCx3QkFvSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSAnLi9xdWV1ZSc7XG5cbi8qKlxuICogUmFiYml0TVEgQ2xpZW50XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBSYWJiaXRcbiAqIEBleHRlbmRzIHtFdmVudEVtaXR0ZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBSYWJiaXQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNoYW5uZWw6IGFueTtcbiAgY29ubmVjdGlvbjogYW1xcC5Db25uZWN0aW9uO1xuICBxdWV1ZXM6IGFueSA9IHt9O1xuICBvcHRpb25zOiBhbnk7XG5cbiAgZ2V0IGxvZ2dlcigpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMubG9nZ2VyKSByZXR1cm4gdGhpcy5vcHRpb25zLmxvZ2dlcjtcbiAgICByZXR1cm4gY29uc29sZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgY29ubmVjdEltbWVkaWF0ZWx5OiB0cnVlLCBcbiAgICAgIHVybDogJ2FtcXA6Ly9sb2NhbGhvc3Q6NTY3MidcbiAgICB9LCBvcHRpb25zKTtcbiAgICBcbiAgICBpZih0aGlzLm9wdGlvbnMuY29ubmVjdEltbWVkaWF0ZWx5KSB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSB0aGlzLmNvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjb25uZWN0KCkge1xuICAgIGlmKHRoaXMuY29ubmVjdGlvbikgcmV0dXJuIHRoaXMuY29ubmVjdGlvbjtcblxuICAgIGNvbnN0IGNvbm5lY3Rpb25TdHIgPSB0aGlzLm9wdGlvbnMudXJsO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlQ29ubmVjdGlvbihjb25uZWN0aW9uU3RyKTtcbiAgICB0aGlzLmNoYW5uZWwgPSBhd2FpdCB0aGlzLmNyZWF0ZUNoYW5uZWwodGhpcy5jb25uZWN0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyByZWNvbm5lY3QoKSB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCgpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCk7XG4gIH1cblxuICBhc3luYyBzdWJzY3JpYmUobmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIC4uLm1pZGRsZXdhcmVzOiBGdW5jdGlvbltdKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlKG5hbWUpO1xuICAgIHJldHVybiBxdWV1ZS5zdWJzY3JpYmUobmFtZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgcHVyZ2UobmFtZSkge1xuICAgIGNvbnN0IHF1ZXVlID0gYXdhaXQgdGhpcy5xdWV1ZXMobmFtZSk7XG4gICAgcmV0dXJuIHF1ZXVlLnB1cmdlKCk7XG4gIH1cblxuICBhc3luYyB1bnN1YnNjcmliZShuYW1lKSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlcyhuYW1lKTtcbiAgICByZXR1cm4gcXVldWUudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2gobmFtZTogc3RyaW5nLCBtZXNzYWdlOiBhbnksIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgY29uc3QgcXVldWUgPSBhd2FpdCB0aGlzLnF1ZXVlKG5hbWUpO1xuICAgIHRoaXMubG9nZ2VyLmluZm8oYFJhYmJpdDogU2VuZGluZyBtZXNzYWdlIHRvIHF1ZXVlICR7bmFtZX1gLCBtZXNzYWdlKTtcbiAgICByZXR1cm4gcXVldWUucHVibGlzaChtZXNzYWdlLCBvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHJlcGx5T2YobmFtZTogc3RyaW5nLCBjb3JyZWxhdGlvbklkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlcGx5TmFtZSA9IGAke25hbWV9X3JlcGx5YDtcbiAgICBjb25zdCBxdWV1ZSA9IGF3YWl0IHRoaXMucXVldWUocmVwbHlOYW1lKTtcbiAgICBcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHF1ZXVlLnN1YnNjcmliZShyZXBseU5hbWUsIChtc2cpID0+IHtcbiAgICAgICAgaWYobXNnLnByb3BlcnRpZXMuY29ycmVsYXRpb25JZCA9PT0gY29ycmVsYXRpb25JZCkge1xuICAgICAgICAgIHJlc29sdmUobXNnKTtcbiAgICAgICAgfVxuICAgICAgfSwgeyBub0FjazogdHJ1ZSB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHF1ZXVlKG5hbWU6IHN0cmluZywgb3B0aW9uczogYW55ID0ge30sIC4uLm1pZGRsZXdhcmVzOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYoIXRoaXMucXVldWVzW25hbWVdKSB7XG4gICAgICB0aGlzLnF1ZXVlc1tuYW1lXSA9IG5ldyBQcm9taXNlKGFzeW5jIHJlc29sdmUgPT4ge1xuICAgICAgICBjb25zdCBjb25uID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uO1xuICAgICAgICBjb25zdCBjaG5sID0gYXdhaXQgdGhpcy5jaGFubmVsO1xuICAgICAgICBjb25zdCBxdWV1ZSA9IG5ldyBRdWV1ZShjaG5sLCBuYW1lLCBvcHRpb25zLCAuLi5taWRkbGV3YXJlcyk7XG4gICAgICAgIGF3YWl0IHF1ZXVlLmluaXRpYWxpemUoKTtcblxuICAgICAgICBpZihvcHRpb25zLnJlcGx5KSB7XG4gICAgICAgICAgY29uc3QgcmVwbHlOYW1lID0gYCR7bmFtZX1fcmVwbHlgO1xuICAgICAgICAgIGNvbnN0IHJlcGx5UXVldWUgPSBuZXcgUXVldWUoY2hubCwgJycsIHsgZXhjbHVzaXZlOiB0cnVlIH0sIC4uLm1pZGRsZXdhcmVzKTtcbiAgICAgICAgICBhd2FpdCByZXBseVF1ZXVlLmluaXRpYWxpemUoKTtcbiAgICAgICAgICB0aGlzLnF1ZXVlW3JlcGx5TmFtZV0gPSByZXBseVF1ZXVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZShxdWV1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5xdWV1ZXNbbmFtZV07XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNvbm5lY3Rpb24oY29ubmVjdGlvblN0cjogc3RyaW5nKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGFtcXAuY29ubmVjdChjb25uZWN0aW9uU3RyKTtcblxuICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLmxvZ2dlci53YXJuKCdSYWJiaXQ6IENvbm5lY3Rpb24gY2xvc2VkJywgZXJyKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICB9KTtcblxuICAgIGNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1JhYmJpdDogQ2hhbm5lbCBjb25uZWN0aW9uIGVycm9yJywgZXJyKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9nZ2VyLmluZm8oYFJhYmJpdDogQ29ubmVjdGlvbiBvcGVuZWQ6ICR7Y29ubmVjdGlvblN0cn1gKTtcblxuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKCkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdSYWJiaXQ6IENvbm5lY3Rpb24gY2xvc2VkIHRocm91Z2ggYXBwIHRlcm1pbmF0aW9uJyk7XG4gICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNoYW5uZWwoY29ubmVjdGlvbikge1xuICAgIGNvbnN0IGNoYW5uZWwgPSBjb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuXG59XG4iXX0=