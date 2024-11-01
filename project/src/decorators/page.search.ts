import { SK_PAGE_SEARCH } from "../constants";
import { IPageSearch } from "../interfaces";

export function PageSearch(options?: IPageSearch) {
  return (target: any, propertyKey: string) => {
    const optionsList: IPageSearch = {
      column: propertyKey,
      is_relational: null,
      is_nested: false,
      operation: "like",
      operator: "or",
      value: null,
      ...options,
    };
    Reflect.defineMetadata(SK_PAGE_SEARCH, optionsList, target, propertyKey);
  };
}
