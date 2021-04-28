import { Provide, App, Config, Inject } from '@midwayjs/decorator';
import { Application, Context } from 'egg';

const crypto = require('crypto');

/**
 * 生成签名的时间戳
 * @return {字符串}
 */
function createTimestamp() {
  return new Date().getTime() / 1000;
}

/**
 * 生成签名的随机串
 * @return {字符串}
 */
function createNonceStr() {
  return Math.random().toString(36).substr(2, 15);
}

/**
 * 对参数对象进行字典排序
 * @param  {对象} args 签名所需参数对象
 * @return {字符串}    排序后生成字符串
 */
function raw(args) {
  let keys = Object.keys(args);
  keys = keys.sort();
  const newArgs = {};
  keys.forEach(key => {
    newArgs[key.toLowerCase()] = args[key];
  });

  let string = '';
  for (const k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
}

// sha1加密
function sha1(str) {
  const shasum = crypto.createHash('sha1');
  shasum.update(str);
  str = shasum.digest('hex');
  return str;
}

@Provide()
export class SignService {
  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Config('wx')
  wx;

  @Config('domain')
  domain;

  async getSign(params) {
    const ret = {
      jsapi_ticket: params.ticket,
      nonceStr: createNonceStr(),
      timestamp: createTimestamp().toString(),
      url: params.url,
    } as any;

    const string = raw(ret);
    ret.signature = sha1(string);
    ret.appId = this.wx.appID;
    console.log('ret', ret);
  }
}
