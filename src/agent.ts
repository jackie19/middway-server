// agent.js
import wechatApi from './lib/wechatApi';
import cache from './lib/cache';
import api from './lib/wechatApi';

class Agent {
  app = null;
  constructor(app) {
    // app.messenger.on('egg-ready', () => {
    //   app.messenger.sendToApp('xxx_action', { data: 1 });
    // });
    this.app = app;
  }
  // 所有的配置已经加载完毕
  // 可以用来加载应用自定义的文件，启动自定义的服务
  async didLoad() {
    await cache.init(this.getAccessToken);
    let data = {
      access_token: '',
      ticket: '',
    };

    data = await this.getAccessToken();
    const ticket = await this.getTicket();

    data = {
      ...data,
      ticket: ticket.data.ticket,
    };

    this.app.messenger.on('egg-ready', () => {
      this.app.messenger.sendToApp('update.access_token', data);
    });
    console.log(data, 'app did load');
  }

  async getAccessToken() {
    const access_token = cache.get('access_token');

    if (access_token) {
      return {
        access_token,
      };
    }

    const appID = this.app.config.wx.appID;
    const appsecret = this.app.config.wx.appsecret;
    const api = wechatApi.accessToken;
    const url = api + '&appid=' + appID + '&secret=' + appsecret;
    const { data } = await this.app.curl(url, { dataType: 'json' });

    cache.put(
      'access_token',
      data.access_token,
      (data.expires_in - 20) * 1000,
      this.getAccessToken
    );

    return data;
  }

  async getTicket() {
    const url = api.getticket + cache.get('access_token');
    const res = await this.app.curl(url, { dataType: 'json' });
    if (res.data.errcode !== 0 || res.data.errmsg !== 'ok') {
      throw new Error(res.data.errcode + ' ' + res.data.errmsg);
    }
    cache.put(
      'ticket',
      res.data.ticket,
      (res.data.expires_in - 20) * 1000,
      this.getTicket
    );
    return res;
  }
}

module.exports = Agent;
