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
  keywordLikeFields?: string[];
  where?: IWhereFunction;
  select?: string[];
  fieldEq?: string[] | FieldEq[];
  leftJoin?: LeftJoinOption[];
  leftJoinAndSelect?: [string, string];
}
interface ICrudOptions extends AnyObject {
  api: APIS[];
  entity: any;
  queryOption?: IQueryOption;
}

export function IController(
  prefix = '/',
  routerOptions = { middleware: [], sensitive: true },
  crudOptions: ICrudOptions
) {
  return target => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetadata(
      CONTROLLER_KEY,
      {
        prefix,
        routerOptions,
        crudOptions,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}
