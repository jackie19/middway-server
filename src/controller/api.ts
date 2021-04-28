import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Provide,
  Query,
  ALL,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { UserService } from '../service/user';
import { DbService } from '../service/db';
import { SignService } from '../service/sign';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  dbService: DbService;

  @Inject()
  signService: SignService;

  @Get('/user')
  async getUser(@Query() uid: string) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  async hasOpenidInDb(openid) {
    const findUser = await this.dbService.getUser(openid);
    return !(Array.isArray(findUser.data) && findUser.data.length === 0);
  }

  @Get('/wechat/login')
  async login(@Query(ALL) query) {
    const data = await this.userService.webToken(query.code);

    const userinfo = await this.userService.userinfo(
      data.data.access_token,
      data.data.openid
    );

    if (userinfo.data.openid) {
      const alreadyHave = await this.hasOpenidInDb(userinfo.data.openid);
      if (!alreadyHave) {
        await this.dbService.saveUser(userinfo.data);
      }
    }
    if (!userinfo.data.openid) {
      return {
        code: userinfo.data.errcode,
        message: userinfo.data.errmsg,
      };
    }
    return { code: 200, data: userinfo.data };
  }

  @Post('/user')
  async saveUser(@Body(ALL) query) {
    const alreadyHave = await this.hasOpenidInDb(query.openid);
    if (!alreadyHave) {
      return await this.dbService.saveUser(query);
    } else {
      return {
        code: 200,
        message: '',
      };
    }
  }

  @Get('/banner')
  async banner() {
    return [
      {
        img: '/public/banner-1.jpg',
      },
    ];
  }

  @Get('/wechat/jssdk/sign')
  async jssdk(@Query('path') path) {
    return await this.signService.getSign({
      path,
    });
  }
}
