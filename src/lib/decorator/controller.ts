import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  CONTROLLER_KEY,
  saveModule,
} from '@midwayjs/decorator';
import { Context, Application } from 'egg';

type APIS = 'add' | 'delete' | 'update' | 'page' | 'info' | 'list';

interface LeftJoinOption {
  entity: any;
  alias: string;
  condition: string;
}
interface FieldEq {
  column: string;
  requestParam: string;
}

interface AnyObject {
  [propName: string]: any;
}

interface Where {
  [index: number]: [string, AnyObject, string?];
}

interface IWhereFunction {
  (ctx: Context, app: Application): Promise<Where>;
}

type orderTypes = 'DESC' | 'ASC';

interface IOrderBy {
  [propName: string]: orderTypes;
}

interface IQueryOption {
  keywordLikeFields?: string[];
  where?: IWhereFunction;
  select?: string[];
  fieldEq?: string[] | FieldEq[];
  orderBy?: IOrderBy;
  leftJoin?: LeftJoinOption[];
}
interface ICurdOptions {
  api: APIS[];
  entity: any;
  queryOption?: IQueryOption;
}

export function IController(
  prefix = '/',
  routerOptions = { middleware: [], sensitive: true },
  curdOptions: ICurdOptions
) {
  return target => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetadata(
      CONTROLLER_KEY,
      {
        prefix,
        routerOptions,
        curdOptions,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}
