import { Repository } from "typeorm";
import { Page } from "../models/page.model";
import { IPageSearch, IPageable } from "../interfaces";
export declare class CommonEntity<T> {
    private readonly _currentRepo;
    constructor(_currentRepo: Repository<T>);
    findAllByPage(pageable: IPageable, queryDto?: Object, customQuery?: IPageSearch[]): Promise<Page<T>>;
    protected _generatePageResult(elements: T[], totalElements: number): Promise<Page<T>>;
    private _getMetaQuery;
    private _recursiveNestedObject;
    private _buildRelation;
    private _buildWhere;
    private _switchContition;
}
