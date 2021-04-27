import { EggAppConfig, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default () => {
  const config = {} as DefaultConfig;

  config.wx = {};
  // 微信号 gh_fc15edc014ed
  config.wx.appID = 'wxf75b896ff7ce2b22';
  config.wx.appsecret = '953256d7d102830735d12eb12985f9cf';

  config.domain = 'https://cc01.loca.lt';

  return config;
};
