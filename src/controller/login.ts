import { ALL, Post, Provide, Body, Inject } from '@midwayjs/decorator';
import { BaseController } from '../core/controller/base';
import { LoginDTO } from '../dto/login';
import { IController } from '../core/decorator/controller';
import { LoginService } from '../service/login';
import { CreateApiDoc } from '@midwayjs/swagger';

@Provide()
@IController()
export class LoginController extends BaseController {
  @Inject()
  loginService: LoginService;

  @(CreateApiDoc()
    .respond(200, '', 'json', {
      example: {
        code: 200,
        message: 'success',
        data: {
          expire: 7200,
          token: '',
          refreshExpire: 1296000,
          refreshToken: '',
        },
      },
    })
    .build())
  @Post('/login')
  async login(@Body(ALL) login: LoginDTO) {
    try {
      const res = await this.loginService.login(login);
      return this.ok(res);
    } catch (e) {
      return this.fail(e.message);
    }
  }
}
