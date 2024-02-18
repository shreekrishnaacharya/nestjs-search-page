import { ApiProperty } from "@nestjs/swagger";
import { IPageable } from "./pageable.interface";

export class Page<T> {
  @ApiProperty({ type: Object })
  public elements: T[];
  @ApiProperty()
  public totalElements: number;
  @ApiProperty()
  public pagable: IPageable;

}
