import { Get, Provide, App } from '@midwayjs/decorator';
import { Application } from 'egg';
import { IController } from '../lib/decorator/controller';

@Provide()
@IController('/test')
export class TestController {
  @App()
  app: Application;

  @Get('/menu')
  async getMenu() {
    return {
      code: 200,
      message: 'ok',
    };
  }
}
