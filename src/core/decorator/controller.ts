import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  CONTROLLER_KEY,
  saveModule,
} from '@midwayjs/decorator';
import { joinURLPath } from '@midwayjs/core/dist/util';

import { ICrudOptions } from '../interface/base';

import config from '../../config/config.default';

export const { routerPrefix } = config({});

// todo 获取 config
export function IController(
  prefix = '/',
  routerOptions = { middleware: [], sensitive: true },
  crudOptions?: ICrudOptions
): ClassDecorator {
  return target => {
    saveModule(CONTROLLER_KEY, target);
    saveClassMetadata(
      CONTROLLER_KEY,
      {
        prefix: joinURLPath(routerPrefix, prefix),
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
