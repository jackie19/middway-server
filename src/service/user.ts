import { Provide, App, Config } from '@midwayjs/decorator';
import { Application } from 'egg';

@Provide()
export class UserService {
  @App()
  app: Application;

  @Config('wx')
  wx;

  async getUser(options) {
    return {
      openid: options.openid,
    };
  }

  async webToken(code) {
    const data = await this.app.curl(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.wx.appID}&secret=${this.wx.appsecret}&code=${code}&grant_type=authorization_code`,
      { dataType: 'json' }
    );
    return data;
  }

  async userinfo(access_token, openid) {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    const data = this.app.curl(url, { dataType: 'json' });
    return data;
  }
}
