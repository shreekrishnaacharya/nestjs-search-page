import { Page } from "../models/page.model";
import { IFindAllByPage, IFindOne } from "../interfaces";
export declare function findAllByPage<T>({ repo, page, queryDto, customQuery }: IFindAllByPage): Promise<Page<T>>;
export declare function findOne<T>({ repo, queryDto, customQuery }: IFindOne): Promise<T>;
