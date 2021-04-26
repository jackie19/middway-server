import {
  Inject,
  Controller,
  Get,
  Provide,
  Query,
  Queries,
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
  async getUser(@Query() uid: string, @Queries() q) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  @Get('/login')
  async login(@Query(ALL) query) {
    const data = await this.userService.webToken(query.code);

    const userinfo = await this.userService.userinfo(
      data.data.access_token,
      data.data.openid
    );

    return { data: userinfo.data };
  }

  @Get('/save/user')
  async saveUser(@Query(ALL) query) {
    const findUser = await this.dbService.getUser(query.openid);
    if (Array.isArray(findUser.data) && findUser.data.length === 0) {
      return await this.dbService.saveUser(query);
    } else {
      return {
        data: findUser.data[0],
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
