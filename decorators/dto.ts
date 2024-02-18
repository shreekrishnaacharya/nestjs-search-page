import { IPageSearch, PAGE_SEARCH } from "../constants";


export function PageSearch(options?: IPageSearch) {
    return (target: any, propertyKey: string) => {
        const optionsList: IPageSearch = {
            is_relational: false,
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
