export interface ISortable {
  asKeyValue(): { [key: string]: string };
}

export type SortDirection = "ASC" | "DESC"