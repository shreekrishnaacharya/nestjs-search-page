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
    const sort = (_a = pageable.getSort()) === null || _a === void 0 ? void 0 : _a.asKeyValue();
    const { where: whereRaw, relations } = _getMetaQuery(whereCondition, customQuery, queryDto, selectDto);
    return {
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
    var _a, _b, _c, _d;
    let relational = {};
    let selection = {};
    for (const key in whereQuery) {
        const pageSearch = Reflect.getMetadata(constants_1.SK_PAGE_SEARCH, whereQuery, key);
        if (pageSearch) {
            if ((_a = pageSearch.column) === null || _a === void 0 ? void 0 : _a.includes(".")) {
                pageSearch.is_nested = (_b = pageSearch === null || pageSearch === void 0 ? void 0 : pageSearch.is_nested) !== null && _b !== void 0 ? _b : true;
            }
            pageSearch.value = whereQuery[key];
            if (((pageSearch.value === true || pageSearch.value === "true") &&
                pageSearch.is_relational === null) ||
                pageSearch.is_relational === true) {
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
        const selectQuery = Reflect.getMetadata(constants_1.SK_PAGE_SEARCH, whereQuery, skey);
        if (selectQuery) {
            if ((_c = selectQuery.column) === null || _c === void 0 ? void 0 : _c.includes(".")) {
                selectQuery.is_nested = (_d = selectQuery === null || selectQuery === void 0 ? void 0 : selectQuery.is_nested) !== null && _d !== void 0 ? _d : true;
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
    conditions === null || conditions === void 0 ? void 0 : conditions.forEach((pageSearch) => {
        var _a, _b;
        if ((_a = pageSearch.column) === null || _a === void 0 ? void 0 : _a.includes(".")) {
            pageSearch.is_nested = (_b = pageSearch === null || pageSearch === void 0 ? void 0 : pageSearch.is_nested) !== null && _b !== void 0 ? _b : true;
        }
        if ((pageSearch.value === true && pageSearch.is_relational !== false) ||
            pageSearch.is_relational === true) {
            relational = _buildRelation(relational, pageSearch);
        }
        else {
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
    return {
        where: [...whereArray],
        relations: Object.assign({}, relational),
        select: Object.assign({}, selection),
    };
}
function _recursiveNestedObject(column, value) {
    if (column.length == 1) {
        const [key] = column;
        return { [key]: value };
    }
    const [key, ...rest] = column;
    return { [key]: _recursiveNestedObject(rest, value) };
}
function _buildRelation(relational, pageSearch) {
    const { column, is_nested } = pageSearch;
    if (!column) {
        return relational;
    }
    if (is_nested) {
        const nested = _recursiveNestedObject(column.split("."), true);
        relational = Object.assign(Object.assign({}, relational), nested);
    }
    else {
        relational[column] = true;
    }
    return relational;
}
function _buildSelect(select, selectQuery) {
    const { column, is_nested } = selectQuery;
    if (!column) {
        return select;
    }
    if (is_nested) {
        const nested = _recursiveNestedObject(column.split("."), true);
        select = Object.assign(Object.assign({}, select), nested);
    }
    else {
        select[column] = true;
    }
    return select;
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
        const nestValue = _switchContition(operation !== null && operation !== void 0 ? operation : "like", value);
        cond = _recursiveNestedObject(nested, nestValue);
    }
    else {
        cond[column] = _switchContition(operation !== null && operation !== void 0 ? operation : "like", value);
    }
    whereConditions[operator !== null && operator !== void 0 ? operator : "or"].push(cond);
}
function _switchContition(operation, value) {
    switch (operation) {
        case "gt":
            return (0, typeorm_1.MoreThan)(value);
        case "gteq":
            return (0, typeorm_1.MoreThanOrEqual)(value);
        case "in":
            return (0, typeorm_1.In)(value);
        case "like":
            return (0, typeorm_1.Like)(`%${value}%`);
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
    function _buildColumnSelect() { }
}
