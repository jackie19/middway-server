import { Provide, App, Config, Inject } from '@midwayjs/decorator';
import { Application, Context } from 'egg';

import api from '../lib/wechatApi';
import menuData from '../lib/menu';

const xml2js = require('xml2js');
const getRawBody = require('raw-body');
const ejs = require('ejs');

@Provide()
export class WechatService {
  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Config('wx')
  wx;

  @Config('domain')
  domain;

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

  //微信消息接收/回复
  async message() {
    const { ctx } = this;
    //接收xml数据
    const xml = await getRawBody(ctx.req, {
      length: ctx.request.length,
      limit: '1mb',
      encoding: ctx.request.charset || 'utf-8',
    });

    const result = (await this.parseXML(xml)) as { xml: any };
    const formatted = (await this.formatMessage(result.xml)) as any;
    if (formatted.MsgType === 'text') {
      return await this.toText(formatted);
    } else if (formatted.MsgType === 'event') {
      if (formatted.Event === 'subscribe') {
        return await this.toText({
          ...formatted,
          Content: '欢迎',
        });
      } else if (formatted.Event === 'CLICK') {
        return await this.toLink({
          title: '欢迎',
          desc: '热烈欢迎',
          url: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.wx.appID}&redirect_uri=${this.domain}/api/login&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`,
          FromUserName: formatted.FromUserName,
          ToUserName: formatted.ToUserName,
          picUrl: this.domain + '/public/banner-1.jpg',
        });
      }
    } else {
      return 'success';
    }
  }
  //解析xml
  async parseXML(xml) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, { trim: true }, (err, obj) => {
        if (err) return reject(err);
        return resolve(obj);
      });
    });
  }
  //把数组转为对象
  async formatMessage(result) {
    function has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    const message = {};
    if (typeof result === 'object') {
      for (const key in result) {
        if (!(result[key] instanceof Array) || result[key].length === 0) {
          continue;
        }
        if (result[key].length === 1) {
          const val = result[key][0];
          if (typeof val === 'object') {
            message[key] = this.formatMessage(val);
          } else {
            message[key] = (val || '').trim();
          }
        } else {
          message[key] = result[key].map(item => {
            return this.formatMessage(item);
          });
        }
      }
    }
    return message;
  }
  async messageTpl() {
    return (
      '<xml>' +
      '<ToUserName><![CDATA[<%-toUserName%>]]></ToUserName>' +
      '<FromUserName><![CDATA[<%-fromUserName%>]]></FromUserName>' +
      '<CreateTime><%=createTime%></CreateTime>' +
      '<MsgType><![CDATA[<%=msgType%>]]></MsgType>' +
      '<Content><![CDATA[<%-content%>]]></Content>' +
      '</xml>'
    );
  }

  async linkTpl() {
    return (
      '<xml>' +
      '<ToUserName><![CDATA[<%-toUserName%>]]></ToUserName>' +
      '<FromUserName><![CDATA[<%-fromUserName%>]]></FromUserName>' +
      '<CreateTime><%=createTime%></CreateTime>' +
      '<MsgType><![CDATA[<%=msgType%>]]></MsgType>' +
      '<ArticleCount>1</ArticleCount>' +
      '<Articles><item>' +
      '<Title><![CDATA[<%-title%>]]></Title>' +
      '<Description><![CDATA[<%-desc%>]]></Description>' +
      '<Url><![CDATA[<%-url%>]]></Url>' +
      '<PicUrl><![CDATA[<%-picUrl%>]]></PicUrl>' +
      '</item></Articles>' +
      '</xml>'
    );
  }

  async toLink(data) {
    const reply = {
      toUserName: data.FromUserName,
      fromUserName: data.ToUserName,
      createTime: new Date().getTime(),
      msgType: 'news',
      title: data.title,
      desc: data.desc,
      url: data.url,
      picUrl: data.picUrl,
    };
    return ejs.render(await this.linkTpl(), reply);
  }

  async toText(message) {
    const reply = {
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName,
      createTime: new Date().getTime(),
      msgType: 'text',
      content: message.Content,
    };
    const output = ejs.render(await this.messageTpl(), reply);
    return output;
  }
}
