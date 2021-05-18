export const security = {
  csrf: false,
};

export const orm = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'cool',
  // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
  synchronize: false,
  // 打印日志
  logging: true,
};
