import { Sort } from "./sort.model";
export class PageRequest {
    constructor(skip = 0, take = 100, sort = new Sort()) {
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
        return new PageRequest(_start, pageSize, Sort.from(_sort, _order));
    }
}
