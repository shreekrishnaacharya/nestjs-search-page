"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRequest = void 0;
const sort_model_1 = require("./sort.model");
class PageRequest {
    constructor(skip = 0, take = 100, sort = new sort_model_1.Sort()) {
        this.skip = skip;
        this.take = take;
        this.sort = sort;
    }
    getSkip() {
        return this.skip;
    }
    getTake() {
        return this.take;
    }
    getSort() {
        return this.sort;
    }
    static from(page) {
        let { _sort, _order, _start, _end } = page;
        if (!_start) {
            _start = 0;
        }
        if (!_end) {
            _end = 10;
        }
        const pageSize = _end - _start;
        return new PageRequest(_start, pageSize, sort_model_1.Sort.from(_sort, _order));
    }
}
exports.PageRequest = PageRequest;
