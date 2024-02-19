import { IPageable } from "./pageable.interface";
export declare class Page<T> {
    elements: T[];
    totalElements: number;
    pagable: IPageable;
}
