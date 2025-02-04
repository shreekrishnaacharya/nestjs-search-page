"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOne = exports.findOptions = exports.findAllByPage = void 0;
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const page_request_model_1 = require("./page-request.model");
function findAllByPage({ repo, page, queryDto, selectDto, customQuery, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = findOptions({
            page,
            queryDto,
            selectDto,
            customQuery,
        });
        const result = yield repo.findAndCount(options);
        const elements = result[0];
        const totalElements = result[1];
        return _generatePageResult(elements, totalElements, page);
    });
}
exports.findAllByPage = findAllByPage;
function findOptions({ page, queryDto, selectDto, customQuery, }) {
    var _a;
    if (page == undefined &&
        queryDto == undefined &&
        customQuery == undefined &&
        selectDto == undefined) {
        throw new Error("One of (page|queryDto|selectDto|customQuery) must be defined");
    }
    const pageable = page ? page_request_model_1.PageRequest.from(page) : undefined;
    let whereCondition = { and: [], or: [] };
    const sort = (_a = pageable === null || pageable === void 0 ? void 0 : pageable.getSort()) === null || _a === void 0 ? void 0 : _a.asKeyValue();
    const { where: whereRaw, relations, select, } = _getMetaQuery(whereCondition, customQuery, queryDto, selectDto);
    return {
        select,
        where: whereRaw,
        order: sort,
        relations: relations,
        skip: pageable === null || pageable === void 0 ? void 0 : pageable.getSkip(),
        take: pageable === null || pageable === void 0 ? void 0 : pageable.getTake(),
    };
}
exports.findOptions = findOptions;
function findOne({ id, repo, queryDto, selectDto, customQuery, }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id == undefined &&
            queryDto == undefined &&
            customQuery == undefined &&
            selectDto == undefined) {
            throw new Error("One of (id|queryDto|selectDto|customQuery) must be defined");
        }
        const cQ = customQuery !== null && customQuery !== void 0 ? customQuery : [];
        if (id) {
            cQ.push({ column: "id", value: id, operation: "eq", operator: "and" });
        }
        const options = findOptions({
            queryDto,
            selectDto,
            customQuery: cQ,
        });
        return yield repo.findOne(options);
    });
}
exports.findOne = findOne;
function _generatePageResult(elements, totalElements, pageable) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            elements,
            totalElements,
            pageable,
        };
    });
}
function _getMetaQuery(whereConditions, conditions, whereQuery, selectDto) {
    var _a, _b;
    let relational = [];
    let selection = {};
    for (const key in whereQuery) {
        const pageSearch = Reflect.getMetadata(constants_1.SK_PAGE_SEARCH, whereQuery, key);
        if (pageSearch) {
            if ((_a = pageSearch.column) === null || _a === void 0 ? void 0 : _a.includes(".")) {
                pageSearch.is_nested = (_b = pageSearch === null || pageSearch === void 0 ? void 0 : pageSearch.is_nested) !== null && _b !== void 0 ? _b : true;
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
        }
        else {
            const selectQuery = Reflect.getMetadata(constants_1.SK_IS_SELECT, whereQuery, key);
            if (selectQuery) {
                if (whereQuery[key] != true) {
                    continue;
                }
                _buildSelect(selection, relational, selectQuery);
            }
        }
    }
    for (const skey in selectDto) {
        const selectQuery = Reflect.getMetadata(constants_1.SK_IS_SELECT, selectDto, skey);
        if (selectQuery) {
            if (selectDto[skey] != true && selectDto[skey] != "true") {
                continue;
            }
            _buildSelect(selection, relational, selectQuery);
        }
    }
    conditions === null || conditions === void 0 ? void 0 : conditions.forEach((pageSearch) => {
        var _a, _b;
        if ("select" in pageSearch) {
            _buildSelect(selection, relational, pageSearch);
        }
        else {
            if ((_a = pageSearch.column) === null || _a === void 0 ? void 0 : _a.includes(".")) {
                pageSearch.is_nested = (_b = pageSearch === null || pageSearch === void 0 ? void 0 : pageSearch.is_nested) !== null && _b !== void 0 ? _b : true;
            }
            _buildWhere(pageSearch, whereConditions);
        }
    });
    let whereArray = [];
    whereConditions.or.forEach((element) => {
        whereArray.push(element);
    });
    if (whereArray.length == 0) {
        whereConditions.and.forEach((ele, i) => {
            whereArray[0] = Object.assign(Object.assign({}, whereArray[0]), ele);
        });
    }
    else if (whereConditions.and.length > 0) {
        let andWhere = {};
        whereConditions.and.forEach((ele, i) => {
            andWhere = Object.assign(Object.assign({}, andWhere), ele);
        });
        whereArray = whereArray.map((element, i) => {
            return Object.assign(Object.assign({}, element), andWhere);
        });
    }
    if (Object.keys(selection).length > 0) {
        selection["id"] = true;
    }
    else {
        selection = undefined;
    }
    return {
        where: [...whereArray],
        relations: [...relational],
        select: Object.assign({}, selection),
    };
}
function _buildRelation(selection, relational, pageSearch) {
    const { column, is_nested } = pageSearch;
    if (!column) {
        return relational;
    }
    _transformData(selection, relational, column, "relational");
    return relational;
}
function _buildSelect(selectGlobal, relational, selectQuery) {
    const { select, type } = selectQuery;
    if (!select) {
        return { select: selectGlobal, relational };
    }
    _transformData(selectGlobal, relational, select, type);
    return { select: selectGlobal, relation: relational };
}
function _buildWhere(pageSearch, whereConditions) {
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
        const nestValue = _switchCondition(operation !== null && operation !== void 0 ? operation : "like", value);
        cond = _recursiveNestedObject(nested, nestValue);
    }
    else {
        cond[column] = _switchCondition(operation !== null && operation !== void 0 ? operation : "like", value);
    }
    whereConditions[operator !== null && operator !== void 0 ? operator : "or"].push(cond);
}
function _switchCondition(operation, value) {
    switch (operation) {
        case "gt":
            return (0, typeorm_1.MoreThan)(value);
        case "gteq":
            return (0, typeorm_1.MoreThanOrEqual)(value);
        case "in":
            return (0, typeorm_1.In)(value);
        case "notIn":
            return (0, typeorm_1.Not)((0, typeorm_1.In)(value));
        case "isNull":
            return (0, typeorm_1.Raw)((alias) => `${alias} IS NULL`);
        case "isNotNull":
            return (0, typeorm_1.Raw)((alias) => `${alias} IS NOT NULL`);
        case "like":
            return (0, typeorm_1.Like)(`%${value}%`);
        case "notLike":
            return (0, typeorm_1.Not)((0, typeorm_1.Like)(`%${value}%`));
        case "lt":
            return (0, typeorm_1.LessThan)(value);
        case "lteq":
            return (0, typeorm_1.LessThanOrEqual)(value);
        case "neq":
            return (0, typeorm_1.Not)((0, typeorm_1.Equal)(value));
        case "between":
            return (0, typeorm_1.Between)(value[0], value[1]);
        default:
            return value;
    }
}
function _transformData(selection, relational, select, type, value = true) {
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
            }
            else {
                current[key] = current[key] || {}; // Ensure intermediate object
                current = current[key];
            }
        });
    }
    else if (typeof select === "object") {
        Object.entries(select).forEach(([key, nestedValue]) => {
            if (type === "default") {
                selection[key] = selection[key] || {}; // Ensure intermediate object exists
                _transformData(selection[key], relational, nestedValue, type, value); // Recursive call
            }
            else if (type === "relational") {
                const relationPath = Object.keys(nestedValue)
                    .map((nestedKey) => `${key}.${nestedKey}`)
                    .join(".");
                relational.push(relationPath); // Add nested relation path
            }
        });
    }
    return { selection, relational };
}
function _recursiveNestedObject(column, value) {
    if (column.length == 1) {
        const [key] = column;
        return { [key]: value };
    }
    const [key, ...rest] = column;
    return { [key]: _recursiveNestedObject(rest, value) };
}
