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
            const content = msg.content.toString();
            return JSON.parse(content);
        }),
        publish: (msg) => __awaiter(this, void 0, void 0, function* () {
            const json = JSON.stringify(msg);
            return new Buffer(json);
        })
    };
}
exports.json = json;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtJQUNFLE1BQU0sQ0FBQztRQUNMLFNBQVMsRUFBRSxDQUFPLEdBQUc7WUFDbkIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUE7UUFDRCxPQUFPLEVBQUUsQ0FBTyxHQUFHO1lBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQTtLQUNGLENBQUM7QUFDSixDQUFDO0FBWEQsb0JBV0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24ganNvbigpIHtcbiAgcmV0dXJuIHtcbiAgICBzdWJzY3JpYmU6IGFzeW5jIChtc2cpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBtc2cuY29udGVudC50b1N0cmluZygpO1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgfSxcbiAgICBwdWJsaXNoOiBhc3luYyAobXNnKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkobXNnKTtcbiAgICAgIHJldHVybiBuZXcgQnVmZmVyKGpzb24pO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==