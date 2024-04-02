import { IPageable } from "../interfaces";
export declare class Page<T> {
    elements: T[];
    totalElements: number;
    pageable: IPageable;
}
