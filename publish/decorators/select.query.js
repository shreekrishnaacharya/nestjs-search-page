"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageSelect = void 0;
const constants_1 = require("../constants");
function PageSelect(options) {
    return (target, propertyKey) => {
        const optionsList = Object.assign({ select: propertyKey, type: "default" }, options);
        Reflect.defineMetadata(constants_1.SK_IS_SELECT, optionsList, target, propertyKey);
    };
}
exports.PageSelect = PageSelect;
