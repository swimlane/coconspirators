"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
let AmqpClient = class AmqpClient extends events_1.EventEmitter {
    connect(uri = 'amqp://localhost:5672') {
        return __awaiter(this, void 0, void 0, function* () {
            this.uri = uri;
            this.connection = yield this.createConnection(this.uri);
            this.channel = yield this.connection.createConfirmChannel();
            this.emit('connected');
            return this.connection;
        });
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
    createConnection(uri) {
        const operation = retry.operation();
        return new Promise((resolve, reject) => {
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
};
AmqpClient = __decorate([
    injection_js_1.Injectable()
], AmqpClient);
exports.AmqpClient = AmqpClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IsK0NBQTBDO0FBRzFDLElBQWEsVUFBVSxHQUF2QixnQkFBd0IsU0FBUSxxQkFBWTtJQU1wQyxPQUFPLENBQUMsTUFBYyx1QkFBdUI7O1lBQ2pELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWYsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1RCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pCLENBQUM7S0FBQTtJQUVLLFNBQVM7O1lBQ2IsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7S0FBQTtJQUVLLFVBQVU7O1lBQ2QsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFFTyxnQkFBZ0IsQ0FBQyxHQUFXO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVwQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUNqQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQU8sT0FBTztnQkFDOUIsSUFBSSxDQUFDO29CQUNILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO3dCQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO3dCQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO3dCQUNuQixVQUFVLENBQUMsS0FBSyxDQUFDOzRCQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7NEJBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xCLENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztnQkFBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNWLEVBQUUsQ0FBQSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsTUFBTSxDQUFDO29CQUM5QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osQ0FBQztZQUNILENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FFRixDQUFBO0FBN0RZLFVBQVU7SUFEdEIseUJBQVUsRUFBRTtHQUNBLFVBQVUsQ0E2RHRCO0FBN0RZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCAqIGFzIGFtcXAgZnJvbSAnYW1xcGxpYic7XG5pbXBvcnQgKiBhcyByZXRyeSBmcm9tICdyZXRyeSc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnaW5qZWN0aW9uLWpzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFtcXBDbGllbnQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbm5lY3Rpb246IGFueTtcbiAgY2hhbm5lbDogYW55O1xuICB1cmk6IHN0cmluZztcblxuICBhc3luYyBjb25uZWN0KHVyaTogc3RyaW5nID0gJ2FtcXA6Ly9sb2NhbGhvc3Q6NTY3MicpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnVyaSA9IHVyaTtcblxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlQ29ubmVjdGlvbih0aGlzLnVyaSk7XG4gICAgdGhpcy5jaGFubmVsID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCh0aGlzLnVyaSk7XG4gIH1cblxuICBhc3luYyBkaXNjb25uZWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYoIXRoaXMuY29ubmVjdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb25uZWN0aW9uIGVzdGFibGlzaGVkIHRvIGRpc2Nvbm5lY3QgZnJvbScpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgcmV0dXJuIGNvbm4uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ29ubmVjdGlvbih1cmk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3Qgb3BlcmF0aW9uID0gcmV0cnkub3BlcmF0aW9uKCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgb3BlcmF0aW9uLmF0dGVtcHQoYXN5bmMgKGF0dGVtcHQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgYW1xcC5jb25uZWN0KHVyaSk7XG4gICAgICAgICAgY29ubmVjdGlvbi5vbmNlKCdjbG9zZScsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXNvbHZlKGNvbm5lY3Rpb24pO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBpZihvcGVyYXRpb24ucmV0cnkoZSkpIHJldHVybjtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==