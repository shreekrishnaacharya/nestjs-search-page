import { FindManyOptions } from "typeorm";
import { Page } from "../models/page.model";
import { IFindAllByPage, IFindOne, IFindOptionByPage } from "../interfaces";
export declare function findAllByPage<T>({ repo, page, queryDto, selectDto, customQuery, }: IFindAllByPage): Promise<Page<T>>;
export declare function findOptions<T>({ page, queryDto, selectDto, customQuery, }: IFindOptionByPage): FindManyOptions;
export declare function findOne<T>({ id, repo, queryDto, selectDto, customQuery, }: IFindOne): Promise<T>;
