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
  Not,
  In,
  Between,
} from "typeorm";

import { Page } from "../models/page.model";
import { Operation, SK_PAGE_SEARCH, SK_IS_SELECT } from "../constants";
import {
  IFindAllByPage,
  IFindOne,
  IFindOptionByPage,
  IPage,
  IPageSearch,
  IPageable,
  IPageSelect,
} from "../interfaces";
import { PageRequest } from "./page-request.model";

type TWhere = { [key: string]: Array<any> };

interface IBuildReturn {
  where: Array<TWhere>;
  relations: object;
  select?: object | Array<string>;
}

export async function findAllByPage<T>({
  repo,
  page,
  queryDto,
  selectDto,
  customQuery,
}: IFindAllByPage): Promise<Page<T>> {
  const options: FindManyOptions<T> = findOptions<T>({
    page,
    queryDto,
    selectDto,
    customQuery,
  });
  const result = await repo.findAndCount(options);
  const elements: T[] = result[0];
  const totalElements: number = result[1];
  return _generatePageResult<T>(elements, totalElements, page);
}

export function findOptions<T>({
  page,
  queryDto,
  selectDto,
  customQuery,
}: IFindOptionByPage): FindManyOptions {
  if (
    page == undefined &&
    queryDto == undefined &&
    customQuery == undefined &&
    selectDto == undefined
  ) {
    throw new Error(
      "One of (page|queryDto|selectDto|customQuery) must be defined"
    );
  }
  const pageable: IPageable = page ? PageRequest.from(page) : undefined;
  let whereCondition = { and: [], or: [] } as TWhere;
  const sort: { [key: string]: string } = pageable.getSort()?.asKeyValue();
  const { where: whereRaw, relations } = _getMetaQuery(
    whereCondition,
    customQuery,
    queryDto,
    selectDto
  );
  return {
    where: whereRaw as unknown as FindOptionsWhere<T>,
    order: sort as unknown as FindOptionsOrder<T>,
    relations: relations,
    skip: pageable?.getSkip(),
    take: pageable?.getTake(),
  };
}

export async function findOne<T>({
  id,
  repo,
  queryDto,
  selectDto,
  customQuery,
}: IFindOne): Promise<T> {
  if (
    id == undefined &&
    queryDto == undefined &&
    customQuery == undefined &&
    selectDto == undefined
  ) {
    throw new Error(
      "One of (id|queryDto|selectDto|customQuery) must be defined"
    );
  }
  const cQ = customQuery ?? [];
  if (id) {
    cQ.push({ column: "id", value: id, operation: "eq", operator: "and" });
  }
  const options: FindManyOptions<T> = findOptions<T>({
    queryDto,
    selectDto,
    customQuery: cQ,
  });
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
    pageable,
  } as Page<T>;
}

function _getMetaQuery(
  whereConditions: TWhere,
  conditions?: IPageSearch[],
  whereQuery?: Object,
  selectDto?: Object
): IBuildReturn {
  let relational = {};
  let selection = {};
  for (const key in whereQuery) {
    const pageSearch: IPageSearch = Reflect.getMetadata(
      SK_PAGE_SEARCH,
      whereQuery,
      key
    );
    if (pageSearch) {
      if (pageSearch.column?.includes(".")) {
        pageSearch.is_nested = pageSearch?.is_nested ?? true;
      }
      pageSearch.value = whereQuery[key];
      if (
        ((pageSearch.value === true || pageSearch.value === "true") &&
          pageSearch.is_relational === null) ||
        pageSearch.is_relational === true
      ) {
        relational = _buildRelation(relational, pageSearch);
        continue;
      }
      if (pageSearch.value.toString() == "") {
        continue;
      }
      _buildWhere(pageSearch, whereConditions);
    }
  }
  for (const skey in selectDto) {
    const selectQuery: IPageSearch = Reflect.getMetadata(
      SK_PAGE_SEARCH,
      whereQuery,
      skey
    );
    if (selectQuery) {
      if (selectQuery.column?.includes(".")) {
        selectQuery.is_nested = selectQuery?.is_nested ?? true;
      }
      if (selectQuery.is_nested) {
        selectQuery.is_relational = true;
      }
      if (selectQuery.is_relational) {
        relational = _buildRelation(relational, selectQuery);
      }
      selection = _buildSelect(selection, selectQuery);
    }
  }
  conditions?.forEach((pageSearch: IPageSearch) => {
    if (pageSearch.column?.includes(".")) {
      pageSearch.is_nested = pageSearch?.is_nested ?? true;
    }
    if (
      (pageSearch.value === true && pageSearch.is_relational !== false) ||
      pageSearch.is_relational === true
    ) {
      relational = _buildRelation(relational, pageSearch);
    } else {
      _buildWhere(pageSearch, whereConditions);
    }
  });
  let whereArray: Array<TWhere> = [];
  whereConditions.or.forEach((element) => {
    whereArray.push(element);
  });
  if (whereArray.length == 0) {
    whereConditions.and.forEach((ele, i) => {
      whereArray[0] = {
        ...whereArray[0],
        ...ele,
      };
    });
  } else if (whereConditions.and.length > 0) {
    let andWhere = {};
    whereConditions.and.forEach((ele, i) => {
      andWhere = {
        ...andWhere,
        ...ele,
      };
    });
    whereArray = whereArray.map((element, i) => {
      return { ...element, ...andWhere };
    });
  }

  return {
    where: [...whereArray],
    relations: { ...relational },
    select: { ...selection },
  };
}

function _recursiveNestedObject(column: Array<string>, value: any) {
  if (column.length == 1) {
    const [key] = column;
    return { [key]: value };
  }
  const [key, ...rest] = column;
  return { [key]: _recursiveNestedObject(rest, value) };
}

function _buildRelation(relational: object, pageSearch: IPageSearch) {
  const { column, is_nested } = pageSearch;
  if (!column) {
    return relational;
  }
  if (is_nested) {
    const nested = _recursiveNestedObject(column.split("."), true);
    relational = {
      ...relational,
      ...nested,
    };
  } else {
    relational[column] = true;
  }

  return relational;
}

function _buildSelect(select: object, selectQuery: IPageSelect) {
  const { column, is_nested } = selectQuery;
  if (!column) {
    return select;
  }
  if (is_nested) {
    const nested = _recursiveNestedObject(column.split("."), true);
    select = {
      ...select,
      ...nested,
    };
  } else {
    select[column] = true;
  }

  return select;
}

function _buildWhere(pageSearch: IPageSearch, whereConditions: TWhere) {
  let cond = {};
  let { column, is_nested, operation, operator, value } = pageSearch;
  if (!column) {
    return whereConditions;
  }
  if (!operation && Array.isArray(value)) {
    operation = "in";
  }
  if (operation == "in" && !Array.isArray(value)) {
    value = [value];
  }
  if (operation == "between" && !Array.isArray(value)) {
    return;
  }
  if (operation == "between" && Array.isArray(value) && value.length < 2) {
    return;
  }
  if (is_nested) {
    const nested = column.split(".");
    const nestValue = _switchContition(operation ?? "like", value);
    cond = _recursiveNestedObject(nested, nestValue);
  } else {
    cond[column] = _switchContition(operation ?? "like", value);
  }
  whereConditions[operator ?? "or"].push(cond);
}

function _switchContition(operation: Operation, value: any) {
  switch (operation) {
    case "gt":
      return MoreThan(value);
    case "gteq":
      return MoreThanOrEqual(value);
    case "in":
      return In(value);
    case "like":
      return Like(`%${value}%`);
    case "lt":
      return LessThan(value);
    case "lteq":
      return LessThanOrEqual(value);
    case "neq":
      return Not(Equal(value));
    case "between":
      return Between(value[0], value[1]);
    default:
      return value;
  }

  function _buildColumnSelect() {}
}
