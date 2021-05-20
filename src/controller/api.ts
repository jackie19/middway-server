import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';

import { UserService } from '../service/user';
import { SignService } from '../service/sign';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  userService: UserService;

  @Inject()
  signService: SignService;

  @Get('/user')
  async getUser(@Query() uid: string) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  @Get('/wechat/login')
  async login(@Query('code') code: string) {
    const data = await this.userService.webToken(code);

    const userinfo = await this.userService.userinfo(
      data.data.access_token,
      data.data.openid
    );

    if (!userinfo.data.openid) {
      return {
        code: userinfo.data.errcode,
        message: userinfo.data.errmsg,
      };
    }
    return { code: 200, data: userinfo.data };
  }

  @Get('/wechat/jssdk/sign')
  async jssdk(@Query('path') path: string) {
    return await this.signService.getSign({
      path,
    });
  }
}
