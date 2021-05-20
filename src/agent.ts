// agent.js
import { NacosConfigClient } from 'nacos';

import wechatApi from './lib/wechatApi';
import cache from './lib/cache';

class Agent {
  app = null;
  constructor(app) {
    this.app = app;
  }
  // 所有的配置已经加载完毕
  // 可以用来加载应用自定义的文件，启动自定义的服务
  async didLoad() {
    await cache.init(this.queen.bind(this));

    this.app.messenger.on('egg-ready', async () => {
      await this.queen();
      await this.nacos();
    });
  }

  async nacos() {
    const { serverAddr, dataId, group } = this.app.config.nacos;
    const configClient = new NacosConfigClient({
      serverAddr,
    });
    configClient.subscribe(
      {
        dataId,
        group,
      },
      content => {
        console.log('nacos=========', dataId, content);
        this.sendToApp(dataId, content);
      }
    );
  }

  async queen() {
    await this.getAccessToken();
    await this.getTicket();
  }

  sendToApp(key, data) {
    this.app.messenger.sendToApp(key, data);
  }

  async getAccessToken() {
    const access_token = cache.get('access_token');

    if (access_token) {
      this.sendToApp('access_token', access_token);
      return access_token;
    }

    const appID = this.app.config.wx.appID;
    const appsecret = this.app.config.wx.appsecret;
    const api = wechatApi.accessToken;
    const url = api + '&appid=' + appID + '&secret=' + appsecret;
    const { data } = await this.app.curl(url, { dataType: 'json' });
    this.sendToApp('access_token', data.access_token);

    cache.put(
      'access_token',
      data.access_token,
      (data.expires_in - 20) * 1000,
      this.getAccessToken.bind(this)
    );

    return data.access_token;
  }

  async getTicket() {
    const ticket = cache.get('ticket');
    if (ticket) {
      this.sendToApp('ticket', ticket);
      return ticket;
    }

    const url = wechatApi.getticket + cache.get('access_token');
    const res = await this.app.curl(url, { dataType: 'json' });
    if (res.data.errcode !== 0 || res.data.errmsg !== 'ok') {
      throw new Error(res.data.errcode + ' ' + res.data.errmsg);
    }
    cache.put(
      'ticket',
      res.data.ticket,
      (res.data.expires_in - 20) * 1000,
      this.getTicket.bind(this)
    );
    this.sendToApp('ticket', res.data.ticket);

    return res.data.ticket;
  }
}

module.exports = Agent;
