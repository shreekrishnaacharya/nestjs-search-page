import { SortDirection } from "@sksharma72000/nestjs-search-page/constants";
import { IPage } from "@sksharma72000/nestjs-search-page/interfaces";
import { Type } from "class-transformer";
import { IsEnum, IsOptional } from "class-validator";


export class PagableDto implements IPage {
    /*
        Define from which row you want to the data list to start from.
        Example:
            Start from 10th item of 1000 items
    */
    @IsOptional()
    @Type(() => Number)
    public _start: number;
    /*
        Define upto which row you want the data list.
        Example:
            Upto 100th item of 1000 items.
            With this the item from 10th to 100th will be responsed.
    */
    @IsOptional()
    @Type(() => Number)
    public _end: number;
    /*
        Define the column that you want the list to be sorted by.
        By default, the list will be sorted buy id in DESC order
    */
    @IsOptional()
    public _sort: string;
    /*
        Define the order of column you want the list to be sorted by.
        By default, the list will be sorted buy in DESC order of id column
    */
    @IsOptional()
    @IsEnum(SortDirection)
    public _order: SortDirection;
}
