import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
const Bmob = require('hydrogen-js-sdk');

export type DefaultConfig = PowerPartial<EggAppConfig>;
Bmob.initialize('876e14873ff14d80', '112233');

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1619428819813_8505';

  // add your config here
  config.middleware = [];

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
  // 微信号 gh_fc15edc014ed
  config.wx.appID = 'wxf75b896ff7ce2b22';
  config.wx.appsecret = '953256d7d102830735d12eb12985f9cf';

  return config;
};
