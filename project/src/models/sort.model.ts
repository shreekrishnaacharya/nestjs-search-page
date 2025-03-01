import { SortDirection } from "../constants";
import { ISortable } from "../interfaces";

export class Sort implements ISortable {
  public direction: SortDirection;
  public column: string;

  constructor(
    column: string = "id",
    direction: SortDirection = SortDirection.DESC
  ) {
    this.direction = direction;
    this.column = column;
  }

  public getSortDirection(): Array<string> {
    return this.direction.split(",");
  }

  public getSortColumn(): Array<string> {
    return this.column.split(",");
  }

  public asKeyValue(): { [key: string]: string } {
    const direction = this.getSortDirection();
    const sort = this.getSortColumn();
    const result: any = {};

    for (let i = 0; i < sort.length; i++) {
      const key = sort[i];
      const value = direction[i];
      const keyParts = key.split(".");
      this.setNestedValue(result, keyParts, value);
    }
    return result;
  }

  public static from(column: string, direction: SortDirection): ISortable {
    return new Sort(column, direction);
  }

  private setNestedValue = (obj: any, keys: string[], value: string) => {
    const key = keys.shift();
    if (!key) return;

    if (!obj[key]) {
      obj[key] = keys.length > 0 ? {} : value;
    }

    if (keys.length > 0) {
      this.setNestedValue(obj[key], keys, value);
    } else {
      obj[key] = value;
    }
  };
}
