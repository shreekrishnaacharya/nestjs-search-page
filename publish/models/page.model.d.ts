import { IPage } from "../interfaces";
export declare class Page<T> {
    elements: T[];
    totalElements: number;
    pageable: IPage;
}
