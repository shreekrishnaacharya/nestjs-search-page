import { SK_IS_SELECT } from "../constants";
import { IPageSelect } from "../interfaces";

export function PageSelect(options?: IPageSelect) {
  return (target: any, propertyKey: string) => {
    const optionsList: IPageSelect = {
      column: propertyKey,
      ...options,
    };
    Reflect.defineMetadata(SK_IS_SELECT, optionsList, target, propertyKey);
  };
}
