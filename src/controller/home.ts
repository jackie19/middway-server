import {
  Controller,
  Inject,
  Get,
  Post,
  Provide,
  Config,
  Query,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { WechatService } from '../service/wechat';

const sha1 = require('sha1');

@Provide()
@Controller('/api/wechat')
export class HomeController {
  @Config('wx')
  wx;

  @Inject()
  ctx: Context;

  @Inject()
  wechatService: WechatService;

  @Get('/index')
  async home(
    @Query() signature,
    @Query() nonce,
    @Query() timestamp,
    @Query() echostr,
    @Query() token
  ) {
    const str = [token, timestamp, nonce].sort().join('');
    const sha = sha1(str);

    console.log(sha === signature, echostr, '微信验证配置=============');
    return echostr + '';
  }

  @Post('/index')
  async index() {
    const xml = await this.wechatService.message();
    console.log('post / ', xml);
    return xml;
  }
}
