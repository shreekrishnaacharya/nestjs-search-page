import {
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
import { Operation, PAGE_SEARCH } from "../constants";
import { IFindAllByPage, IFindOne, IPage, IPageSearch, IPageable } from "../interfaces";
import { PageRequest } from "./page-request.model";

type TWhere = { [key: string]: Array<any> }

interface IBuildReturn {
  where: Array<TWhere>
  relations: object
}

export async function findAllByPage<T>({
  repo,
  page,
  queryDto,
  customQuery
}: IFindAllByPage): Promise<Page<T>> {
  const pageable: IPageable = PageRequest.from(page);
  let whereCondition = { and: [], or: [] } as TWhere;
  const sort: { [key: string]: string } = pageable.getSort()?.asKeyValue();
  const { where: whereRaw, relations } = _getMetaQuery(whereCondition, customQuery, queryDto)
  const options: FindManyOptions<T> = {
    where: whereRaw as unknown as FindOptionsWhere<T>,
    order: sort as unknown as FindOptionsOrder<T>,
    relations: relations,
    skip: pageable.getSkip(),
    take: pageable.getTake(),
  };
  const result = await repo.findAndCount(options);
  const elements: T[] = result[0];
  const totalElements: number = result[1];
  return _generatePageResult<T>(elements, totalElements, page);
}

export async function findOne<T>({
  id,
  repo,
  queryDto,
  customQuery
}: IFindOne): Promise<T> {
  let whereCondition = { and: [], or: [] } as TWhere;
  const cQ = customQuery ?? [];
  if (id) {
    cQ.push({ column: "id", value: id, operation: "eq", operator: "and" })
  }
  const { where: whereRaw, relations } = _getMetaQuery(whereCondition, cQ, queryDto)
  const options: FindManyOptions<T> = {
    where: whereRaw as unknown as FindOptionsWhere<T>,
    relations: relations,
  };
  return await repo.findOne(options);
}

async function _generatePageResult<T>(
  elements: T[],
  totalElements: number,
  pageable: IPage
): Promise<Page<T>> {
  return {
    elements,
    totalElements,
    pageable
  } as Page<T>;
}

function _getMetaQuery(whereConditions: TWhere, conditions?: IPageSearch[], metaQuery?: object): IBuildReturn {
  let relational = {};
  for (const key in metaQuery) {
    const pageSearch: IPageSearch = Reflect.getMetadata(PAGE_SEARCH, metaQuery, key);
    if (pageSearch) {
      if (pageSearch.column?.includes(".")) {
        pageSearch.is_nested = pageSearch?.is_nested ?? true;
      }
      pageSearch.value = metaQuery[key]
      if (((pageSearch.value === true || pageSearch.value === "true") && pageSearch.is_relational === null) || pageSearch.is_relational === true) {
        relational = _buildRelation(relational, pageSearch);
        continue;
      }
      if (typeof pageSearch.value === "string" && pageSearch.value.toString() === "") {
        continue;
      }
      _buildWhere(pageSearch, whereConditions)
    }
  }
  conditions?.forEach((pageSearch: IPageSearch) => {
    if (pageSearch.column?.includes(".")) {
      pageSearch.is_nested = pageSearch?.is_nested ?? true;
    }
    if ((pageSearch.value === true && pageSearch.is_relational !== false) || pageSearch.is_relational === true) {
      relational = _buildRelation(relational, pageSearch);
    } else {
      _buildWhere(pageSearch, whereConditions)
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

function _recursiveNestedObject(column: Array<string>, value: any) {
  if (column.length == 1) {
    const [key] = column
    return { [key]: value }
  }
  const [key, ...rest] = column
  return { [key]: _recursiveNestedObject(rest, value) }
}

function _buildRelation(relational: object, pageSearch: IPageSearch) {
  const { column, is_nested } = pageSearch
  if (!column) {
    return relational;
  }
  if (is_nested) {
    const nested = _recursiveNestedObject(column.split("."), true);
    relational = {
      ...relational,
      ...nested
    }
  } else {
    relational[column] = true;
  }

  return relational;
}
function _buildWhere(pageSearch: IPageSearch, whereConditions: TWhere) {
  let i = 0;
  let cond = {};
  const { column, is_nested, operation, operator, value } = pageSearch
  if (!column) {
    return whereConditions;
  }
  if (is_nested) {
    const nested = column.split('.');
    const nestValue = _switchContition(operation ?? 'like', value)
    cond = _recursiveNestedObject(nested, nestValue);
  } else {
    cond[column] = _switchContition(operation ?? 'like', value);
  }
  whereConditions[operator ?? 'or'].push(cond)
}

function _switchContition(operation: Operation, value: any) {
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

