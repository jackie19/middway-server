import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';
/**
 * 登录参数校验
 */
export class LoginDTO {
  // 用户名
  @CreateApiPropertyDoc('用户名', {
    example: 'admin',
  })
  @Rule(RuleType.string().required())
  username: string;

  // 密码
  @CreateApiPropertyDoc('密码', {
    example: '123456',
  })
  @Rule(RuleType.string().required())
  password: string;
}
