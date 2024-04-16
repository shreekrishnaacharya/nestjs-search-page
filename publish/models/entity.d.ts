import { FindManyOptions } from "typeorm";
import { Page } from "../models/page.model";
import { IFindAllByPage, IFindOne } from "../interfaces";
export declare function findAllByPage<T>({ repo, page, queryDto, customQuery }: IFindAllByPage): Promise<Page<T>>;
export declare function findOptions<T>({ page, queryDto, customQuery }: IFindAllByPage): Promise<FindManyOptions>;
export declare function findOne<T>({ id, repo, queryDto, customQuery }: IFindOne): Promise<T>;
