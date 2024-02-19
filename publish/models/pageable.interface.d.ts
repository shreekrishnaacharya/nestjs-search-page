import { ISortable } from "./sortable.interface";
export interface IPageable {
    getSkip(): number;
    getTake(): number;
    getSort(): ISortable;
}
