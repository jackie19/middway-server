import { EggAppConfig, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default appInfo => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1619428819813_8505';

  // add your config here
  config.middleware = ['ctrlMiddleware'];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };
  // todo https://eggjs.org/zh-cn/core/security.html
  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.wx = {};

  // 全局路由前缀
  config.routerPrefix = 'api';

  config.midwayFeature = {
    replaceEggLogger: true,
  };

  return config;
};
