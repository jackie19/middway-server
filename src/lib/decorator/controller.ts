import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  CONTROLLER_KEY,
  saveModule,
} from '@midwayjs/decorator';

export function IController(
  prefix = '/',
  routerOptions = { middleware: [], sensitive: true }
) {
  return target => {
    saveModule(CONTROLLER_KEY, target);
    if (prefix) {
      saveClassMetadata(
        CONTROLLER_KEY,
        {
          prefix: `/dxp${prefix}`,
          routerOptions,
        },
        target
      );
    }
    Scope(ScopeEnum.Request)(target);
  };
}
