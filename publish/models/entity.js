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
exports.CommonEntity = void 0;
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
const page_request_model_1 = require("./page-request.model");
class CommonEntity {
    constructor(_currentRepo) {
        this._currentRepo = _currentRepo;
    }
    findAllByPage(page, queryDto, customQuery) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const pageable = page_request_model_1.PageRequest.from(page);
            let whereCondition = { and: [], or: [] };
            const sort = (_a = pageable.getSort()) === null || _a === void 0 ? void 0 : _a.asKeyValue();
            const { where: whereRaw, relations } = this._getMetaQuery(whereCondition, customQuery, queryDto);
            const options = {
                where: whereRaw,
                order: sort,
                relations: relations,
                skip: pageable.getSkip(),
                take: pageable.getTake(),
            };
            const result = yield this._currentRepo.findAndCount(options);
            const elements = result[0];
            const totalElements = result[1];
            return this._generatePageResult(elements, totalElements);
        });
    }
    _generatePageResult(elements, totalElements) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                elements: elements,
                totalElements: totalElements,
            };
        });
    }
    _getMetaQuery(whereConditions, conditions, metaQuery) {
        var _a, _b;
        let relational = {};
        for (const key in metaQuery) {
            const pageSearch = Reflect.getMetadata(constants_1.PAGE_SEARCH, metaQuery, key);
            if (pageSearch) {
                if ((_a = pageSearch.column) === null || _a === void 0 ? void 0 : _a.includes(".")) {
                    pageSearch.is_nested = (_b = pageSearch === null || pageSearch === void 0 ? void 0 : pageSearch.is_nested) !== null && _b !== void 0 ? _b : true;
                }
                pageSearch.value = metaQuery[key];
                if ((pageSearch.value === true && pageSearch.is_relational === null) || pageSearch.is_relational === true) {
                    relational = this._buildRelation(relational, pageSearch);
                    continue;
                }
                if (typeof pageSearch.value === "string" && pageSearch.value.toString() === "") {
                    console.log("skipped :", pageSearch.value);
                    continue;
                }
                this._buildWhere(pageSearch, whereConditions);
            }
        }
        conditions === null || conditions === void 0 ? void 0 : conditions.forEach((pageSearch) => {
            var _a, _b;
            if ((_a = pageSearch.column) === null || _a === void 0 ? void 0 : _a.includes(".")) {
                pageSearch.is_nested = (_b = pageSearch === null || pageSearch === void 0 ? void 0 : pageSearch.is_nested) !== null && _b !== void 0 ? _b : true;
            }
            if ((pageSearch.value === true && pageSearch.is_relational !== false) || pageSearch.is_relational === true) {
                relational = this._buildRelation(relational, pageSearch);
            }
            else {
                this._buildWhere(pageSearch, whereConditions);
            }
        });
        let whereArray = [];
        whereConditions.or.forEach(element => {
            whereArray.push(element);
        });
        if (whereArray.length == 0) {
            whereConditions.and.forEach((ele, i) => {
                whereArray[0] = Object.assign(Object.assign({}, whereArray), ele);
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
        return { where: [...whereArray], relations: Object.assign({}, relational) };
    }
    _recursiveNestedObject(column, value) {
        if (column.length == 1) {
            const [key] = column;
            return { [key]: value };
        }
        const [key, ...rest] = column;
        return { [key]: this._recursiveNestedObject(rest, value) };
    }
    _buildRelation(relational, pageSearch) {
        const { column, is_nested } = pageSearch;
        if (!column) {
            return relational;
        }
        if (is_nested) {
            const nested = this._recursiveNestedObject(column.split("."), true);
            relational = Object.assign(Object.assign({}, relational), nested);
        }
        else {
            relational[column] = true;
        }
        return relational;
    }
    _buildWhere(pageSearch, whereConditions) {
        let i = 0;
        let cond = {};
        const { column, is_nested, operation, operator, value } = pageSearch;
        if (!column) {
            return whereConditions;
        }
        if (is_nested) {
            const nested = column.split('.');
            const nestValue = this._switchContition(operation !== null && operation !== void 0 ? operation : 'like', value);
            cond = this._recursiveNestedObject(nested, nestValue);
        }
        else {
            cond[column] = this._switchContition(operation !== null && operation !== void 0 ? operation : 'like', value);
        }
        whereConditions[operator !== null && operator !== void 0 ? operator : 'or'].push(cond);
    }
    _switchContition(operation, value) {
        switch (operation) {
            case "gt":
                return (0, typeorm_1.MoreThan)(value);
            case "gteq":
                return (0, typeorm_1.MoreThanOrEqual)(value);
            // case "in":
            //   return In(value)
            case "like":
                return (0, typeorm_1.Like)(`%${value}%`);
            case "lt":
                return (0, typeorm_1.LessThan)(value);
            case "lteq":
                return (0, typeorm_1.LessThanOrEqual)(value);
            case "neq":
                return (0, typeorm_1.Not)((0, typeorm_1.Equal)(value));
            default:
                return value;
        }
    }
}
exports.CommonEntity = CommonEntity;
