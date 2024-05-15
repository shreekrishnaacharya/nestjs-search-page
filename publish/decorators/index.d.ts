import { IPageSearch, ISelectColumn, ISelectRelation } from "../interfaces";
export declare function PageSearch(options?: IPageSearch): (target: any, propertyKey: string) => void;
export declare function SelectRelation(options?: ISelectRelation): (target: any, propertyKey: string) => void;
export declare function SelectColumn(options?: ISelectColumn): (target: any, propertyKey: string) => void;
