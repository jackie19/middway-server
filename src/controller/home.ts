import { Controller, Get, Provide } from '@midwayjs/decorator';
import { BaseController } from '../core/controller/base';

@Provide()
@Controller('/')
export class HomeController extends BaseController {
  @Get('/')
  async home() {
    return this.app.config[this.app.config.nacos.dataId];
  }
}
