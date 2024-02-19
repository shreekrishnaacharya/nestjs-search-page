export declare const IS_RELATIONAL = "isRelational";
export declare const PAGE_SEARCH = "PAGE_SEARCH";
export type Operation = "eq" | "neq" | "gt" | "gteq" | "lt" | "lteq" | "like";
export type Operator = "and" | "or";
export interface IPageSearch {
    is_relational?: boolean;
    column: string;
    is_nested?: boolean;
    operation?: Operation;
    operator?: Operator;
    value?: string | number | boolean | null;
}
