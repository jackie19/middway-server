import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
const Bmob = require('hydrogen-js-sdk');

export type DefaultConfig = PowerPartial<EggAppConfig>;
Bmob.initialize('876e14873ff14d80', '112233');

export default (appInfo: EggAppInfo) => {
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
  config.routerPrefix = '/dxp';

  config.midwayFeature = {
    replaceEggLogger: true,
  };

  return config;
};
