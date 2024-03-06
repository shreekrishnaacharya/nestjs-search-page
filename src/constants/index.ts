export const IS_RELATIONAL = "isRelational"
export const PAGE_SEARCH = "PAGE_SEARCH"

export type Operation = "eq" | "neq" | "gt" | "gteq" | "lt" | "lteq" | "like"

export type Operator = "and" | "or"

export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}