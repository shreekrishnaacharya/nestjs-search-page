import { SortDirection } from "../enums/response-status.enum";

export interface ISortable {
  asKeyValue(): { [key: string]: string };
}
