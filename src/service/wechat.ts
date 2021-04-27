import { Provide, App, Config } from '@midwayjs/decorator';
import { Application } from 'egg';
import api from '../lib/wechatApi';
import menuData from '../lib/menu';

@Provide()
export class WechatService {
  @App()
  app: Application;

  @Config('wx')
  wx;

  async updateAccessToken() {
    const appID = this.wx.appID;
    const appsecret = this.wx.appsecret;
    const url = api.accessToken + '&appid=' + appID + '&secret=' + appsecret;

    const body = await this.app.curl(url, { dataType: 'json' });

    return body.data;
  }

  async clearMenu() {
    const url =
      api.menu.delete + 'access_token=' + this.app.config.access_token;
    console.log(this.app.config.access_token, ' ===================');
    const res = await this.app.curl(url, { dataType: 'json' });
    if (res.data.errcode === 0) {
      return res;
    } else {
      throw new Error('菜单删除失败');
    }
  }

  async createMenu() {
    const url =
      api.menu.create + 'access_token=' + this.app.config.access_token;
    const res = await this.app.curl(url, {
      dataType: 'json',
      method: 'POST',
      data: JSON.stringify(menuData),
    });
    if (res.data.errcode === 0) {
      return res;
    } else {
      throw new Error('菜单创建失败: ' + res.data.errmsg);
    }
  }

  async updateMenu() {
    await this.clearMenu();
    await this.createMenu();
    return '菜单ok';
  }
}
