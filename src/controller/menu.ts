import { Inject, Controller, Get, Provide, App } from '@midwayjs/decorator';
import { Application } from 'egg';
import { WechatService } from '../service/wechat';

@Provide()
@Controller('/api/wechat')
export class MenuController {
  @App()
  app: Application;

  @Inject()
  wechatService: WechatService;

  @Get('/menu')
  async getMenu() {
    const res = await this.wechatService.updateMenu();
    return {
      code: 200,
      message: res,
    };
  }
}
