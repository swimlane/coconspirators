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
function json() {
    return {
        subscribe: (msg) => __awaiter(this, void 0, void 0, function* () {
            if (msg) {
                const content = msg.toString();
                return JSON.parse(content);
            }
        }),
        publish: (msg) => __awaiter(this, void 0, void 0, function* () {
            const json = JSON.stringify(msg);
            return new Buffer(json);
        })
    };
}
exports.json = json;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtJQUNFLE1BQU0sQ0FBQztRQUNMLFNBQVMsRUFBRSxDQUFPLEdBQUc7WUFDbkIsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDUCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLENBQUM7UUFDSCxDQUFDLENBQUE7UUFDRCxPQUFPLEVBQUUsQ0FBTyxHQUFHO1lBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQTtLQUNGLENBQUM7QUFDSixDQUFDO0FBYkQsb0JBYUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24ganNvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBzdWJzY3JpYmU6IGFzeW5jIChtc2cpID0+IHtcbiAgICAgIGlmKG1zZykge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gbXNnLnRvU3RyaW5nKCk7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcHVibGlzaDogYXN5bmMgKG1zZykgPT4ge1xuICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KG1zZyk7XG4gICAgICByZXR1cm4gbmV3IEJ1ZmZlcihqc29uKTtcbiAgICB9XG4gIH07XG59XG4iXX0=