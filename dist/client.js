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
const util_1 = require("./util");
class AmqpClient extends events_1.EventEmitter {
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
}
exports.AmqpClient = AmqpClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLGdDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IsaUNBQStCO0FBRS9CLGdCQUF3QixTQUFRLHFCQUFZO0lBTTFDO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLFlBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBSyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUFjLHVCQUF1QjtRQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUVmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFSyxTQUFTOztZQUNiLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFSyxVQUFVOztZQUNkLEVBQUUsQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztZQUNsRSxDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRWEsYUFBYTs7WUFDekIsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsQ0FBQztLQUFBO0lBRU8sZ0JBQWdCLENBQUMsR0FBVztRQUNsQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFcEMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFPLE9BQU87WUFDOUIsSUFBSSxDQUFDO2dCQUNILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO29CQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHO29CQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUNuQixVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDO3dCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QyxDQUFDO1lBQUMsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVixFQUFFLENBQUEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUFDLE1BQU0sQ0FBQztnQkFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUM7UUFDSCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUVGO0FBekVELGdDQXlFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBhbXFwIGZyb20gJ2FtcXBsaWInO1xuaW1wb3J0ICogYXMgcmV0cnkgZnJvbSAncmV0cnknO1xuaW1wb3J0IHsgZGVmZXIgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgQW1xcENsaWVudCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29ubmVjdGlvbjogYW55O1xuICBjaGFubmVsOiBhbnk7XG4gIHVyaTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gZGVmZXIoKTtcbiAgICB0aGlzLmNoYW5uZWwgPSBkZWZlcigpO1xuICB9XG5cbiAgY29ubmVjdCh1cmk6IHN0cmluZyA9ICdhbXFwOi8vbG9jYWxob3N0OjU2NzInKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLnVyaSA9IHVyaTtcblxuICAgIHRoaXMuY3JlYXRlQ29ubmVjdGlvbih0aGlzLnVyaSk7XG4gICAgdGhpcy5jcmVhdGVDaGFubmVsKCk7XG5cbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgYXdhaXQgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdCh0aGlzLnVyaSk7XG4gIH1cblxuICBhc3luYyBkaXNjb25uZWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYoIXRoaXMuY29ubmVjdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb25uZWN0aW9uIGVzdGFibGlzaGVkIHRvIGRpc2Nvbm5lY3QgZnJvbScpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb247XG4gICAgcmV0dXJuIGNvbm4uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY3JlYXRlQ2hhbm5lbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uO1xuICAgIGNvbnN0IGNoYW5uZWwgPSBhd2FpdCBjb25uZWN0aW9uLmNyZWF0ZUNvbmZpcm1DaGFubmVsKCk7XG4gICAgdGhpcy5jaGFubmVsLnJlc29sdmUoY2hhbm5lbCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNvbm5lY3Rpb24odXJpOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBvcGVyYXRpb24gPSByZXRyeS5vcGVyYXRpb24oKTtcblxuICAgIG9wZXJhdGlvbi5hdHRlbXB0KGFzeW5jIChhdHRlbXB0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgYW1xcC5jb25uZWN0KHVyaSk7XG4gICAgICAgIGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnLCBlcnIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25uZWN0aW9uLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICBjb25uZWN0aW9uLmNsb3NlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucmVzb2x2ZShjb25uZWN0aW9uKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBpZihvcGVyYXRpb24ucmV0cnkoZSkpIHJldHVybjtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGUpO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24ucmVqZWN0KGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==