"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageSearch = void 0;
const constants_1 = require("../constants");
function PageSearch(options) {
    return (target, propertyKey) => {
        const optionsList = Object.assign({ is_relational: false, column: propertyKey, is_nested: false, operation: "like", operator: "or", value: null }, options);
        Reflect.defineMetadata(constants_1.PAGE_SEARCH, optionsList, target, propertyKey);
    };
}
exports.PageSearch = PageSearch;
