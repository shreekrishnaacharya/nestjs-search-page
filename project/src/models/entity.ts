import {
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  FindManyOptions,
  Like,
  Equal,
  MoreThan,
  MoreThanOrEqual,
  LessThan,
  LessThanOrEqual,
  Not
} from "typeorm";
import { Page } from "../models/page.model";
import { Operation, Operator, PAGE_SEARCH } from "../constants";
import { IPage, IPageSearch, IPageable } from "../interfaces";
import { PageRequest } from "./page-request.model";

type TWhere = { [key: string]: Array<any> }

interface IBuildReturn {
  where: Array<TWhere>
  relations: object
}

export class CommonEntity<T> {
  constructor(private readonly _currentRepo: Repository<T>) { }
  public async findAllByPage(
    page: IPage,
    queryDto?: Object,
    customQuery?: IPageSearch[]
  ): Promise<Page<T>> {
    const pageable: IPageable = PageRequest.from(page);
    let whereCondition = { and: [], or: [] } as TWhere;
    const sort: { [key: string]: string } = pageable.getSort()?.asKeyValue();
    const { where: whereRaw, relations } = this._getMetaQuery(whereCondition, customQuery, queryDto)
    const options: FindManyOptions<T> = {
      where: whereRaw as unknown as FindOptionsWhere<T>,
      order: sort as unknown as FindOptionsOrder<T>,
      relations: relations,
      skip: pageable.getSkip(),
      take: pageable.getTake(),
    };
    const result = await this._currentRepo.findAndCount(options);
    const elements: T[] = result[0];
    const totalElements: number = result[1];
    return this._generatePageResult(elements, totalElements);
  }

  protected async _generatePageResult(
    elements: T[],
    totalElements: number,
  ): Promise<Page<T>> {
    return {
      elements: elements,
      totalElements: totalElements,
    } as Page<T>;
  }

  private _getMetaQuery(whereConditions: TWhere, conditions?: IPageSearch[], metaQuery?: object): IBuildReturn {
    let relational = {};
    for (const key in metaQuery) {
      const pageSearch: IPageSearch = Reflect.getMetadata(PAGE_SEARCH, metaQuery, key);
      if (pageSearch) {
        if (pageSearch.column?.includes(".")) {
          pageSearch.is_nested = pageSearch?.is_nested ?? true;
        }
        pageSearch.value = metaQuery[key]
        if ((pageSearch.value == true && pageSearch.is_relational == null) || pageSearch.is_relational == true) {
          relational = this._buildRelation(relational, pageSearch);
          continue;
        }
        if (typeof pageSearch.value === "string" && pageSearch.value.toString() === "") {
          console.log("skipped :", pageSearch.value)
          continue;
        }
        this._buildWhere(pageSearch, whereConditions)
      }
    }
    conditions?.forEach((pageSearch: IPageSearch) => {
      if (pageSearch.column?.includes(".")) {
        pageSearch.is_nested = pageSearch?.is_nested ?? true;
      }
      if ((pageSearch.value == true && pageSearch.is_relational != false) || pageSearch.is_relational == true) {
        relational = this._buildRelation(relational, pageSearch);
      } else {
        this._buildWhere(pageSearch, whereConditions)
      }
    });
    let whereArray: Array<TWhere> = [];
    whereConditions.or.forEach(element => {
      whereArray.push(element)
    });
    if (whereArray.length == 0) {
      whereConditions.and.forEach((ele, i) => {
        whereArray[0] = {
          ...whereArray,
          ...ele
        }
      });
    } else if (whereConditions.and.length > 0) {
      let andWhere = {};
      whereConditions.and.forEach((ele, i) => {
        andWhere = {
          ...andWhere,
          ...ele
        }
      });
      whereArray = whereArray.map((element, i) => {
        return { ...element, ...andWhere }
      });
    }

    return { where: [...whereArray], relations: { ...relational } };
  }

  private _recursiveNestedObject(column: Array<string>, value: any) {
    if (column.length == 1) {
      const [key] = column
      return { [key]: value }
    }
    const [key, ...rest] = column
    return { [key]: this._recursiveNestedObject(rest, value) }
  }

  private _buildRelation(relational: object, pageSearch: IPageSearch) {
    const { column, is_nested } = pageSearch
    if (!column) {
      return relational;
    }
    if (is_nested) {
      const nested = this._recursiveNestedObject(column.split("."), true);
      relational = {
        ...relational,
        ...nested
      }
    } else {
      relational[column] = true;
    }

    return relational;
  }
  private _buildWhere(pageSearch: IPageSearch, whereConditions: TWhere) {
    let i = 0;
    let cond = {};
    const { column, is_nested, operation, operator, value } = pageSearch
    if (!column) {
      return whereConditions;
    }
    if (is_nested) {
      const nested = column.split('.');
      const nestValue = this._switchContition(operation ?? 'like', value)
      cond = this._recursiveNestedObject(nested, nestValue);
    } else {
      cond[column] = this._switchContition(operation ?? 'like', value);
    }
    whereConditions[operator ?? 'or'].push(cond)
  }

  private _switchContition(operation: Operation, value: any) {
    switch (operation) {
      case "gt":
        return MoreThan(value)
      case "gteq":
        return MoreThanOrEqual(value)
      // case "in":
      //   return In(value)
      case "like":
        return Like(`%${value}%`)
      case "lt":
        return LessThan(value)
      case "lteq":
        return LessThanOrEqual(value)
      case "neq":
        return Not(Equal(value))
      default:
        return value
    }
  }
}
