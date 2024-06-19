"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectColumn = exports.SelectRelation = exports.PageSearch = void 0;
const constants_1 = require("../constants");
function PageSearch(options) {
    return (target, propertyKey) => {
        const optionsList = Object.assign({ column: propertyKey, is_relational: null, is_nested: false, operation: "like", operator: "or", value: null }, options);
        Reflect.defineMetadata(constants_1.PAGE_SEARCH, optionsList, target, propertyKey);
    };
}
exports.PageSearch = PageSearch;
function SelectRelation(options) {
    return (target, propertyKey) => {
        const optionsList = Object.assign({ column: propertyKey }, options);
        Reflect.defineMetadata(constants_1.IS_RELATIONAL, optionsList, target, propertyKey);
    };
}
exports.SelectRelation = SelectRelation;
function SelectColumn(options) {
    return (target, propertyKey) => {
        const optionsList = Object.assign({ column: propertyKey }, options);
        Reflect.defineMetadata(constants_1.IS_SELECT, optionsList, target, propertyKey);
    };
}
exports.SelectColumn = SelectColumn;
