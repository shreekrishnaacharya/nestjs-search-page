import { IPage } from "../interfaces";

export class Page<T> {
  public elements: T[];
  public totalElements: number;
  public pageable: IPage;
}
