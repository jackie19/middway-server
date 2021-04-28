import { Provide, App, Config, Inject } from '@midwayjs/decorator';
import { Application, Context } from 'egg';

const sha2 = require('sha1');

/**
 * 生成签名的时间戳
 * @return {string}
 */
function createTimestamp() {
  return new Date().getTime().toString();
}

/**
 * 生成签名的随机串
 * @return {string}
 */
function createNonceStr() {
  return Math.random().toString(36).substr(2, 15);
}

/**
 * 对参数对象进行字典排序
 * @param  {object} args 签名所需参数对象
 * @return {string}    排序后生成字符串
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
      jsapi_ticket: this.app.config.ticket,
      nonceStr: createNonceStr(),
      timestamp: createTimestamp(),
      url: this.domain + params.path,
    } as any;

    const string = raw(ret);
    ret.signature = sha2(string);
    ret.appId = this.wx.appID;
    ret.jsapi_ticket = undefined;
    return ret;
  }
}
