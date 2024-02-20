import { SortDirection } from "../constants";
import { ISortable } from "../interfaces";
export declare class Sort implements ISortable {
    direction: SortDirection;
    column: string;
    constructor(column?: string, direction?: SortDirection);
    getSortDirection(): Array<string>;
    getSortColumn(): Array<string>;
    asKeyValue(): {
        [key: string]: string;
    };
    static from(column: string, direction: SortDirection): ISortable;
}
