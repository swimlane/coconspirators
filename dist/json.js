"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0lBQ0UsTUFBTSxDQUFDO1FBQ0wsU0FBUyxFQUFFLENBQU8sR0FBRztZQUNuQixFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNQLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUNELE9BQU8sRUFBRSxDQUFPLEdBQUc7WUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFBO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFiRCxvQkFhQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBqc29uKCkge1xuICByZXR1cm4ge1xuICAgIHN1YnNjcmliZTogYXN5bmMgKG1zZykgPT4ge1xuICAgICAgaWYobXNnKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBtc2cudG9TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwdWJsaXNoOiBhc3luYyAobXNnKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkobXNnKTtcbiAgICAgIHJldHVybiBuZXcgQnVmZmVyKGpzb24pO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==