import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  CONTROLLER_KEY,
  saveModule,
} from '@midwayjs/decorator';

import { ICrudOptions } from '../interface/base';

// todo 获取 config
export function IController(
  prefix = '/',
  routerOptions = { middleware: [], sensitive: true },
  crudOptions: ICrudOptions
): ClassDecorator {
  return target => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetadata(
      CONTROLLER_KEY,
      {
        prefix: `/api/${prefix}`,
        routerOptions: {
          tagName: target.name,
          ...routerOptions,
        },
        crudOptions,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}
