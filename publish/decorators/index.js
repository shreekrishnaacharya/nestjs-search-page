import { PAGE_SEARCH } from "../constants";
export function PageSearch(options) {
    return (target, propertyKey) => {
        const optionsList = Object.assign({ is_relational: false, column: propertyKey, is_nested: false, operation: "like", operator: "or", value: null }, options);
        Reflect.defineMetadata(PAGE_SEARCH, optionsList, target, propertyKey);
    };
}
