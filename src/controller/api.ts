import {
  Inject,
  Controller,
  Get,
  Provide,
  Query,
  Queries,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { IGetUserResponse } from '../interface';
import { UserService } from '../service/user';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser(@Query() uid: string, @Queries() q): Promise<IGetUserResponse> {
    console.log(q, '====');
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }
}
