import { Provide, App, Config } from '@midwayjs/decorator';
import { Application } from 'egg';
const Bmob = require('hydrogen-js-sdk');

@Provide()
export class DbService {
  @App()
  app: Application;

  @Config('wx')
  wx;

  async saveUser(options) {
    const query = Bmob.Query('users');
    query.set('nickname', JSON.stringify(options.nickname));
    query.set('city', options.city);
    query.set('province', options.province);
    query.set('headimgurl', options.headimgurl);
    query.set('openid', options.openid);
    const res = await query.save();

    return {
      data: res,
    };
  }

  async getUser(openid) {
    const query = Bmob.Query('users');
    query.equalTo('openid', '==', openid);
    const data = await query.find();
    return { data };
  }
}
