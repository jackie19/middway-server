import {
  Controller,
  Inject,
  Get,
  Provide,
  Config,
  Query,
} from '@midwayjs/decorator';
import { Context } from 'egg';
// eslint-disable-next-line node/no-unpublished-require
const sha1 = require('sha1');

@Provide()
@Controller('/')
export class HomeController {
  @Config('wx')
  wx;

  @Inject()
  ctx: Context;

  @Get('/')
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
}
