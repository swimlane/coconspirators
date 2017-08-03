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
const events_1 = require("events");
const amqp = require("amqplib");
const retry = require("retry");
const injection_js_1 = require("injection-js");
const util_1 = require("./util");
let AmqpClient = class AmqpClient extends events_1.EventEmitter {
    constructor() {
        super();
        this.connection = util_1.defer();
        this.channel = util_1.defer();
    }
    connect(uri = 'amqp://localhost:5672') {
        this.uri = uri;
        this.createConnection(this.uri);
        this.createChannel();
        return this.connection;
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.disconnect();
            return this.connect(this.uri);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                throw new Error('No connection established to disconnect from');
            }
            const conn = yield this.connection;
            return conn.close();
        });
    }
    createChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.connection;
            const channel = yield connection.createConfirmChannel();
            this.channel.resolve(channel);
        });
    }
    createConnection(uri) {
        const operation = retry.operation();
        operation.attempt((attempt) => __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield amqp.connect(uri);
                connection.once('close', (err) => {
                    this.emit('disconnected', err);
                });
                connection.on('error', (err) => {
                    this.emit('error', err);
                    this.emit('disconnected', err);
                });
                process.on('SIGINT', () => {
                    connection.close().then(() => {
                        this.emit('disconnected');
                        process.exit(0);
                    });
                });
                this.emit('connected');
                this.connection.resolve(connection);
            }
            catch (e) {
                if (operation.retry(e))
                    return;
                this.emit('error', e);
                this.connection.reject(e);
            }
        }));
    }
};
AmqpClient = __decorate([
    injection_js_1.Injectable(),
    __metadata("design:paramtypes", [])
], AmqpClient);
exports.AmqpClient = AmqpClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IsK0NBQTBDO0FBQzFDLGlDQUErQjtBQUcvQixJQUFhLFVBQVUsR0FBdkIsZ0JBQXdCLFNBQVEscUJBQVk7SUFNMUM7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBSyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFLLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQWMsdUJBQXVCO1FBQzNDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRWYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQUVLLFNBQVM7O1lBQ2IsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7S0FBQTtJQUVLLFVBQVU7O1lBQ2QsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFFYSxhQUFhOztZQUN6QixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDekMsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFTyxnQkFBZ0IsQ0FBQyxHQUFXO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVwQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQU8sT0FBTztZQUM5QixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUc7b0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUc7b0JBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQ25CLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7d0JBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLENBQUM7WUFBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEVBQUUsQ0FBQSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDO2dCQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQztRQUNILENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDTCxDQUFDO0NBRUYsQ0FBQTtBQXpFWSxVQUFVO0lBRHRCLHlCQUFVLEVBQUU7O0dBQ0EsVUFBVSxDQXlFdEI7QUF6RVksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCAqIGFzIHJldHJ5IGZyb20gJ3JldHJ5JztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdpbmplY3Rpb24tanMnO1xuaW1wb3J0IHsgZGVmZXIgfSBmcm9tICcuL3V0aWwnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW1xcENsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29ubmVjdGlvbjogYW55O1xuICBjaGFubmVsOiBhbnk7XG4gIHVyaTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gZGVmZXIoKTtcbiAgICB0aGlzLmNoYW5uZWwgPSBkZWZlcigpO1xuICB9XG5cbiAgY29ubmVjdCh1cmk6IHN0cmluZyA9ICdhbXFwOi8vbG9jYWxob3N0OjU2NzInKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLnVyaSA9IHVyaTtcblxuICAgIHRoaXMuY3JlYXRlQ29ubmVjdGlvbih0aGlzLnVyaSk7XG4gICAgdGhpcy5jcmVhdGVDaGFubmVsKCk7XG5cbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCh0aGlzLnVyaSk7XG4gIH1cblxuICBhc3luYyBkaXNjb25uZWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYoIXRoaXMuY29ubmVjdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb25uZWN0aW9uIGVzdGFibGlzaGVkIHRvIGRpc2Nvbm5lY3QgZnJvbScpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgcmV0dXJuIGNvbm4uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlQ2hhbm5lbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uO1xuICAgIGNvbnN0IGNoYW5uZWwgPSBhd2FpdCBjb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5jaGFubmVsLnJlc29sdmUoY2hhbm5lbCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNvbm5lY3Rpb24odXJpOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBvcGVyYXRpb24gPSByZXRyeS5vcGVyYXRpb24oKTtcblxuICAgIG9wZXJhdGlvbi5hdHRlbXB0KGFzeW5jIChhdHRlbXB0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgYW1xcC5jb25uZWN0KHVyaSk7XG4gICAgICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25uZWN0aW9uLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICBjb25uZWN0aW9uLmNsb3NlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucmVzb2x2ZShjb25uZWN0aW9uKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBpZihvcGVyYXRpb24ucmV0cnkoZSkpIHJldHVybjtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGUpO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucmVqZWN0KGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==