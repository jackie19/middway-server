import { Inject, Controller, Get, Patch, Provide } from '@midwayjs/decorator';
import { WechatService } from '../service/wechat';

@Provide()
@Controller('/api/wechat')
export class MenuController {
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
  @Patch('/menu')
  async saveMenu() {
    const res = await this.wechatService.updateMenu();
    return {
      code: 200,
      message: res,
    };
  }
}
