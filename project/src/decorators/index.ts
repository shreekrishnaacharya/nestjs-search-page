import { IS_RELATIONAL, IS_SELECT, PAGE_SEARCH } from "../constants";
import { IPageSearch, ISelectColumn, ISelectRelation } from "../interfaces";


export function PageSearch(options?: IPageSearch) {
    return (target: any, propertyKey: string) => {
        const optionsList: IPageSearch = {
            column: propertyKey,
            is_nested: false,
            operation: "like",
            operator: "or",
            value: null,
            ...options
        }
        Reflect.defineMetadata(PAGE_SEARCH, optionsList, target, propertyKey);
    };
}

export function SelectRelation(options?: ISelectRelation) {
    return (target: any, propertyKey: string) => {
        const optionsList: ISelectRelation = {
            column: propertyKey,
            ...options
        }
        Reflect.defineMetadata(IS_RELATIONAL, optionsList, target, propertyKey);
    };
}

export function SelectColumn(options?: ISelectColumn) {
    return (target: any, propertyKey: string) => {
        const optionsList: ISelectColumn = {
            column: propertyKey,
            ...options
        }
        Reflect.defineMetadata(IS_SELECT, optionsList, target, propertyKey);
    };
}