import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  CONTROLLER_KEY,
  saveModule,
} from '@midwayjs/decorator';

import { ICrudOptions } from '../interface/base';

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
