import { IPageable } from "./pageable.interface";
import { ISortable, SortDirection } from "./sortable.interface";
interface IPage {
    _start: number;
    _end: number;
    _sort: string;
    _order: SortDirection;
}
export declare class PageRequest implements IPageable {
    skip: number;
    take: number;
    sort: ISortable;
    constructor(skip?: number, take?: number, sort?: ISortable);
    getSkip(): number;
    getTake(): number;
    getSort(): ISortable;
    static from(page: IPage): IPageable;
}
export {};
