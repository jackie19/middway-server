export const wx = {
  appID: 'wxf75b896ff7ce2b22',
  appsecret: '953256d7d102830735d12eb12985f9cf',
};

export const domain = 'https://cc01.loca.lt';

export const orm = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'cool',
  // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
  synchronize: true,
  // 打印日志
  logging: true,
};

export const logger = {
  coreLogger: {
    consoleLevel: 'INFO',
  },
};
