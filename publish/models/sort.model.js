"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sort = void 0;
const constants_1 = require("../constants");
class Sort {
    constructor(column = "id", direction = constants_1.SortDirection.DESC) {
        this.setNestedValue = (obj, keys, value) => {
            const key = keys.shift();
            if (!key)
                return;
            if (!obj[key]) {
                obj[key] = keys.length > 0 ? {} : value;
            }
            if (keys.length > 0) {
                this.setNestedValue(obj[key], keys, value);
            }
            else {
                obj[key] = value;
            }
        };
        this.direction = direction;
        this.column = column;
    }
    getSortDirection() {
        return this.direction.split(",");
    }
    getSortColumn() {
        return this.column.split(",");
    }
    asKeyValue() {
        const direction = this.getSortDirection();
        const sort = this.getSortColumn();
        const result = {};
        for (let i = 0; i < sort.length; i++) {
            const key = sort[i];
            const value = direction[i];
            const keyParts = key.split(".");
            this.setNestedValue(result, keyParts, value);
        }
        return result;
    }
    static from(column, direction) {
        return new Sort(column, direction);
    }
}
exports.Sort = Sort;
