import { IPage, IPageable, ISortable } from "../interfaces";
import { Sort } from "./sort.model";

export class PageRequest implements IPageable {
  public skip: number;
  public take: number;
  public sort: ISortable;

  constructor(
    skip: number = 0,
    take: number = 100,
    sort: ISortable = new Sort()
  ) {
    this.skip = skip;
    this.take = take;
    this.sort = sort;
  }

  public getSkip(): number {
    return this.skip;
  }

  public getTake(): number {
    return this.take;
  }

  public getSort(): ISortable {
    return this.sort;
  }

  public static from(page: IPage): IPageable {
    let { _sort, _order, _start, _end } = page
    if (!_start) {
      _start = 0;
    }
    if (!_end) {
      _end = 10;
    }
    const pageSize = _end - _start;
    return new PageRequest(_start, pageSize, Sort.from(_sort, _order));
  }
}
