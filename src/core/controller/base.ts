import { App } from '@midwayjs/decorator';
import { Application } from 'egg';
import { RESCODE, RESMESSAGE } from '../constants/global';
import { IRes } from '../interface/base';

export abstract class BaseController {
  @App()
  app: Application;

  /**
   * 成功返回
   * @param data 返回数据
   */
  ok(data): IRes {
    const res: IRes = {
      code: RESCODE.SUCCESS,
      message: RESMESSAGE.SUCCESS,
    };
    if (data) {
      res.data = data;
    }
    return res;
  }
  /**
   * 失败返回
   * @param message
   * @param code
   */
  fail(message, code = RESCODE.COMMFAIL): IRes {
    return {
      code,
      message: message
        ? message
        : code === RESCODE.VALIDATEFAIL
        ? RESMESSAGE.VALIDATEFAIL
        : RESMESSAGE.COMMFAIL,
    };
  }
}
