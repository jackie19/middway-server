// agent.js
import wechatApi from './lib/wechatApi';

const api = wechatApi.accessToken;

class Agent {
  app = null;
  constructor(app) {
    // app.messenger.on('egg-ready', () => {
    //   app.messenger.sendToApp('xxx_action', { data: 1 });
    // });
    this.app = app;
  }

  async didLoad() {
    const appID = this.app.config.wx.appID;
    const appsecret = this.app.config.wx.appsecret;
    const url = api + '&appid=' + appID + '&secret=' + appsecret;

    const { data } = await this.app.curl(url, { dataType: 'json' });
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
    console.log(data, 'app did load');
    this.app.messenger.on('egg-ready', () => {
      this.app.messenger.sendToApp('update.access_token', {
        access_token: data.access_token,
      });
    });
  }
}

module.exports = Agent;
