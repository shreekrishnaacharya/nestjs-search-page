import { IPageable } from "../interfaces";

export class Page<T> {
  public elements: T[];
  public totalElements: number;
  public pageable: IPageable;
}
