export const SK_IS_RELATIONAL = "SK_IS_RELATIONAL"
export const SK_IS_SELECT = "SK_IS_SELECT"
export const SK_PAGE_SEARCH = "SK_PAGE_SEARCH"

export type Operation = "eq" | "neq" | "in" | "gt" | "gteq" | "lt" | "lteq" | "like" | "between"

export type Operator = "and" | "or"

export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}