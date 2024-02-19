import { IPageable } from "./pageable.interface";

export class Page<T> {
  public elements: T[];
  public totalElements: number;
  public pagable: IPageable;

}
