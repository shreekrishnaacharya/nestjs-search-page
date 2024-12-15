import { SK_IS_SELECT } from "../constants";
import { IPageSelect } from "../interfaces";

export function PageSelect(options?: IPageSelect) {
  return (target: any, propertyKey: string) => {
    const optionsList: IPageSelect = {
      select: propertyKey,
      type: "default",
      ...options,
    };
    Reflect.defineMetadata(SK_IS_SELECT, optionsList, target, propertyKey);
  };
}
