var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getIcon(task) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`https://api.iconify.design/search?query=${encodeURIComponent(task)}`);
        const data = yield res.json();
        return ((_a = data.icons) === null || _a === void 0 ? void 0 : _a[0]) || undefined;
    });
}
export function showIcon(task) {
    return __awaiter(this, void 0, void 0, function* () {
        const icon = yield getIcon(task);
        if (icon === undefined) {
            return undefined;
        }
        const el = document.createElement("span");
        el.className = "iconify text-white text-xl";
        el.setAttribute("data-icon", icon);
        return el;
    });
}
