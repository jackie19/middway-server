import {
  Inject,
  Controller,
  Get,
  Provide,
  Query,
  ALL,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { UserService } from '../service/user';
import { DbService } from '../service/db';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  dbService: DbService;

  @Get('/get_user')
  async getUser(@Query() uid: string) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  async hasOpenidInDb(openid) {
    const findUser = await this.dbService.getUser(openid);
    return !(Array.isArray(findUser.data) && findUser.data.length === 0);
  }

  @Get('/login')
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

  @Get('/save/user')
  async saveUser(@Query(ALL) query) {
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
}
