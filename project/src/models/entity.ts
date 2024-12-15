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
  const sort: { [key: string]: string } = pageable?.getSort()?.asKeyValue();
  const {
    where: whereRaw,
    relations,
    select,
  } = _getMetaQuery(whereCondition, customQuery, queryDto, selectDto);
  return {
    select,
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
  conditions?: Array<IPageSearch | IPageSearch>,
  whereQuery?: Object,
  selectDto?: Object
): IBuildReturn {
  let relational: string[] = [];
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
      if (pageSearch.is_relational) {
        _buildRelation(selection, relational, pageSearch);
        continue;
      }
      pageSearch.value = whereQuery[key];
      if (pageSearch.value.toString() == "") {
        continue;
      }
      _buildWhere(pageSearch, whereConditions);
    } else {
      const selectQuery: IPageSelect = Reflect.getMetadata(
        SK_IS_SELECT,
        whereQuery,
        key
      );
      if (selectQuery) {
        if (whereQuery[key] != true) {
          continue;
        }
        _buildSelect(selection, relational, selectQuery);
      }
    }
  }
  for (const skey in selectDto) {
    const selectQuery: IPageSelect = Reflect.getMetadata(
      SK_IS_SELECT,
      selectDto,
      skey
    );
    if (selectQuery) {
      if (selectDto[skey] != true || selectDto[skey] != "true") {
        continue;
      }
      _buildSelect(selection, relational, selectQuery);
    }
  }
  conditions?.forEach((pageSearch: IPageSearch | IPageSelect) => {
    if ("select" in pageSearch) {
      _buildSelect(selection, relational, pageSearch);
    } else {
      if (pageSearch.column?.includes(".")) {
        pageSearch.is_nested = pageSearch?.is_nested ?? true;
      }
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
  if (Object.keys(selection).length > 0) {
    selection["id"] = true;
  } else {
    selection = undefined;
  }
  return {
    where: [...whereArray],
    relations: [...relational],
    select: { ...selection },
  };
}

function _buildRelation(
  selection: object,
  relational: string[],
  pageSearch: IPageSearch
) {
  const { column, is_nested } = pageSearch;
  if (!column) {
    return relational;
  }
  _transformData(selection, relational, column, "relational");
  return relational;
}

function _buildSelect(
  selectGlobal: object,
  relational: string[],
  selectQuery: IPageSelect
) {
  const { select, type } = selectQuery;
  if (!select) {
    return { select: selectGlobal, relational };
  }
  _transformData(selectGlobal, relational, select, type);
  return { select: selectGlobal, relation: relational };
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
    const nestValue = _switchCondition(operation ?? "like", value);
    cond = _recursiveNestedObject(nested, nestValue);
  } else {
    cond[column] = _switchCondition(operation ?? "like", value);
  }
  whereConditions[operator ?? "or"].push(cond);
}

function _switchCondition(operation: Operation, value: any) {
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
}

function _transformData(
  selection: any,
  relational: any[],
  select: string | object,
  type: "relational" | "default",
  value: any = true
) {
  if (typeof select === "string") {
    if (type == "relational") {
      relational.push(select);
      return { selection, relational };
    }
    const keys = select.split(".");
    const relatable = [...keys];
    relatable.pop();
    let current = selection;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        if (relatable.length) {
          relational.push(relatable.join("."));
        }
        current[key] = value; // Add value to selection
      } else {
        current[key] = current[key] || {}; // Ensure intermediate object
        current = current[key];
      }
    });
  } else if (typeof select === "object") {
    Object.entries(select).forEach(([key, nestedValue]) => {
      if (type === "default") {
        selection[key] = selection[key] || {}; // Ensure intermediate object exists
        _transformData(selection[key], relational, nestedValue, type, value); // Recursive call
      } else if (type === "relational") {
        const relationPath = Object.keys(nestedValue)
          .map((nestedKey) => `${key}.${nestedKey}`)
          .join(".");
        relational.push(relationPath); // Add nested relation path
      }
    });
  }

  return { selection, relational };
}

function _recursiveNestedObject(column: Array<string>, value: any) {
  if (column.length == 1) {
    const [key] = column;
    return { [key]: value };
  }
  const [key, ...rest] = column;
  return { [key]: _recursiveNestedObject(rest, value) };
}
