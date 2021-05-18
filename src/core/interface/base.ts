/**
 * @description
 */
import { Application, Context } from 'egg';
import { RESCODE, RESMESSAGE } from '../constants/global';

type APIS = 'add' | 'delete' | 'update' | 'page' | 'info' | 'list';

interface LeftJoinOption {
  entity: any;
  alias: string;
  condition: string;
  selects: string[];
}
interface FieldEq {
  column: string;
  requestParam: string;
}

interface AnyObject {
  [propName: string]: any;
}

type WhereItem = [string, AnyObject];

interface IWhereFunction {
  (ctx: Context, app: Application): Promise<WhereItem[]>;
}

// type orderTypes = 'DESC' | 'ASC';

export interface IQueryOption {
  keywordLikeFields: string[];
  where: IWhereFunction;
  select: string[];
  fieldEq: string[] | FieldEq[];
  leftJoin: LeftJoinOption[];
  leftJoinAndSelect: [string, string];
}

export interface ICrudOptions extends AnyObject {
  api: APIS[];
  entity: any;
  queryOption?: Partial<IQueryOption>;
}

export interface IRes {
  code: RESCODE;
  message: RESMESSAGE;
  data?: any;
}
