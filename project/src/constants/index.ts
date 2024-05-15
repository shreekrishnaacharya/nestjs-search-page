export const IS_RELATIONAL = "IS_RELATIONAL"
export const IS_SELECT = "IS_SELECT"
export const PAGE_SEARCH = "PAGE_SEARCH"

export type Operation = "eq" | "neq" | "in" | "gt" | "gteq" | "lt" | "lteq" | "like" | "between"

export type Operator = "and" | "or"

export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}