import { Operation, Operator, SortDirection } from "../constants";
import { Repository } from "typeorm";
export interface IPageSearch {
    column?: string;
    is_relational?: boolean;
    is_nested?: boolean;
    operation?: Operation;
    operator?: Operator;
    value?: string | number | boolean | null | Array<string | number | boolean>;
}
export interface ISelectRelation {
    column?: string;
}
export interface ISelectColumn {
    column?: string;
}
export interface IPage {
    _start: number;
    _end: number;
    _sort: string;
    _order: SortDirection;
}
export interface ISortable {
    asKeyValue(): {
        [key: string]: string;
    };
}
export interface IFindAllByPage {
    repo: Repository<any>;
    page: IPage;
    queryDto?: Object;
    customQuery?: IPageSearch[];
}
export interface IFindOptionByPage {
    page?: IPage;
    queryDto?: Object;
    customQuery?: IPageSearch[];
}
export interface IFindOne {
    id?: string | number;
    repo: Repository<any>;
    queryDto?: Object;
    customQuery?: IPageSearch[];
}
export interface IPageable {
    getSkip(): number;
    getTake(): number;
    getSort(): ISortable;
}
