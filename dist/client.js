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
                        connection.close().then(() => {
                            this.emit('disconnected');
                            process.exit(0);
                        });
                    });
                    resolve(connection);
                }
                catch (e) {
                    if (operation.retry(e))
                        return;
                    this.emit('error', e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IsK0NBQTBDO0FBRzFDLElBQWEsVUFBVSxHQUF2QixnQkFBd0IsU0FBUSxxQkFBWTtJQU1wQyxPQUFPLENBQUMsTUFBYyx1QkFBdUI7O1lBQ2pELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWYsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1RCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pCLENBQUM7S0FBQTtJQUVLLFNBQVM7O1lBQ2IsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7S0FBQTtJQUVLLFVBQVU7O1lBQ2QsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFFTyxnQkFBZ0IsQ0FBQyxHQUFXO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVwQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUNqQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQU8sT0FBTztnQkFDOUIsSUFBSSxDQUFDO29CQUNILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO3dCQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO3dCQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2pDLENBQUMsQ0FBQyxDQUFDO29CQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO3dCQUNuQixVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNsQixDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7Z0JBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDVixFQUFFLENBQUEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUFDLE1BQU0sQ0FBQztvQkFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWixDQUFDO1lBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUVGLENBQUE7QUE5RFksVUFBVTtJQUR0Qix5QkFBVSxFQUFFO0dBQ0EsVUFBVSxDQThEdEI7QUE5RFksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCAqIGFzIHJldHJ5IGZyb20gJ3JldHJ5JztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdpbmplY3Rpb24tanMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW1xcENsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29ubmVjdGlvbjogYW55O1xuICBjaGFubmVsOiBhbnk7XG4gIHVyaTogc3RyaW5nO1xuXG4gIGFzeW5jIGNvbm5lY3QodXJpOiBzdHJpbmcgPSAnYW1xcDovL2xvY2FsaG9zdDo1NjcyJyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMudXJpID0gdXJpO1xuXG4gICAgdGhpcy5jb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVDb25uZWN0aW9uKHRoaXMudXJpKTtcbiAgICB0aGlzLmNoYW5uZWwgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uY3JlYXRlQ29uZmlybUNoYW5uZWwoKTtcbiAgICB0aGlzLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyByZWNvbm5lY3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBhd2FpdCB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0KHRoaXMudXJpKTtcbiAgfVxuXG4gIGFzeW5jIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZighdGhpcy5jb25uZWN0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbm5lY3Rpb24gZXN0YWJsaXNoZWQgdG8gZGlzY29ubmVjdCBmcm9tJyk7XG4gICAgfVxuXG4gICAgY29uc3QgY29ubiA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbjtcbiAgICByZXR1cm4gY29ubi5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDb25uZWN0aW9uKHVyaTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBvcGVyYXRpb24gPSByZXRyeS5vcGVyYXRpb24oKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBvcGVyYXRpb24uYXR0ZW1wdChhc3luYyAoYXR0ZW1wdCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBhbXFwLmNvbm5lY3QodXJpKTtcbiAgICAgICAgICBjb25uZWN0aW9uLm9uY2UoJ2Nsb3NlJywgKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29ubmVjdGlvbi5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXNvbHZlKGNvbm5lY3Rpb24pO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBpZihvcGVyYXRpb24ucmV0cnkoZSkpIHJldHVybjtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZSk7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=