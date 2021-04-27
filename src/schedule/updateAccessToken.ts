import { Provide, Schedule, CommonSchedule, Inject } from '@midwayjs/decorator';
import { WechatService } from '../service/wechat';

@Provide()
@Schedule({
  interval: 7000 * 1000, // 7000s 间隔
  type: 'all', // 指定某一个 worker 执行
})
export class UpdateAccessToken implements CommonSchedule {
  @Inject()
  wechatService: WechatService;
  // 定时执行的具体任务
  async exec(ctx) {
    const data = await this.wechatService.updateAccessToken();
    ctx.logger.info(data.access_token);
    ctx.app.config.access_token = data.access_token;
  }
}
