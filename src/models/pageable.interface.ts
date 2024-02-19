import { ISortable } from "./sortable.interface";

export interface IPageable {
  getSkip(): number;
  getTake(): number;
  getSort(): ISortable;
  // next(totalElements: number): IPageable;
  // previous(totalElements: number): IPageable;
}