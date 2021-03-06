import {
  Controller,
  Inject,
  Get,
  Post,
  Provide,
  Config,
  Query,
} from '@midwayjs/decorator';
import { WechatService } from '../service/wechat';

const sha1 = require('sha1');

@Provide()
@Controller('/api/wechat')
export class WechatController {
  @Config('wx')
  wx;

  @Inject()
  wechatService: WechatService;

  @Get('/index')
  async home(
    @Query() signature: string,
    @Query() nonce: string,
    @Query() timestamp: string,
    @Query() echostr: string,
    @Query() token: string
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
