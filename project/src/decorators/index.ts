import { SK_IS_RELATIONAL, SK_IS_SELECT, SK_PAGE_SEARCH } from "../constants";
import { IPageSearch, ISelectColumn } from "../interfaces";


export function PageSearch(options?: IPageSearch) {
    return (target: any, propertyKey: string) => {
        const optionsList: IPageSearch = {
            column: propertyKey,
            is_relational: null,
            is_nested: false,
            operation: "like",
            operator: "or",
            value: null,
            ...options
        }
        Reflect.defineMetadata(SK_PAGE_SEARCH, optionsList, target, propertyKey);
    };
}

export function SelectColumn(options?: ISelectColumn) {
    return (target: any, propertyKey: string) => {
        const optionsList: ISelectColumn = {
            column: propertyKey,
            ...options
        }
        Reflect.defineMetadata(SK_IS_SELECT, optionsList, target, propertyKey);
    };
}