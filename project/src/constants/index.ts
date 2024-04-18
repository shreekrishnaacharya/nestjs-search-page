export const IS_RELATIONAL = "isRelational"
export const PAGE_SEARCH = "PAGE_SEARCH"

export type Operation = "eq" | "neq" | "in" | "gt" | "gteq" | "lt" | "lteq" | "like"

export type Operator = "and" | "or"

export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}