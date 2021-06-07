import { Controller, Get, Provide, Headers } from '@midwayjs/decorator';
import { BaseController } from '../core/controller/base';
import { CreateApiDoc } from '@midwayjs/swagger';

@Provide()
@Controller('/')
export class HomeController extends BaseController {
  @Get('/')
  async home() {
    const { nacos } = this.app.config;
    return this.app.config[nacos?.dataId];
  }

  @(CreateApiDoc().build())
  @Get('/test/auth', { middleware: ['authMiddleware'] })
  async testAuthMiddleware(@Headers() token: string) {
    return this.ok(token);
  }
}
