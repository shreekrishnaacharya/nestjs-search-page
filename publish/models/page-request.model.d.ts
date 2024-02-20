import { IPage, IPageable, ISortable } from "../interfaces";
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
