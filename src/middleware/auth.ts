import { Config, Provide, Inject } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { CacheManager } from '@midwayjs/cache';

// import { APIS } from '../constants/global';

// function needValid(url) {
//   return (
//     _.endsWith(url, APIS.ADD) ||
//     _.endsWith(url, APIS.DELETE) ||
//     _.endsWith(url, APIS.UPDATE)
//   );
// }

@Provide()
export class AuthMiddleware implements IWebMiddleware {
  @Config()
  jwt;
  @Inject()
  cache: CacheManager;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      let statusCode = 200;
      const { url } = ctx;
      const token = ctx.get('token');
      // 控制器前执行的逻辑
      // 执行下一个 Web 中间件，最后执行到控制器x
      try {
        ctx.admin = jwt.verify(token, this.jwt.secret);
      } catch (err) {
        if (_.endsWith(url, 'skip-auth')) {
          await next();
          return;
        }

        if (ctx.admin) {
          if (ctx.admin.isRefresh) {
            statusCode = 401;
          }

          const cacheToken = await this.cache.get(
            `token:${ctx.admin.username}`
          );
          if (!cacheToken || cacheToken !== token) {
            statusCode = 401;
          }
        } else {
          statusCode = 401;
        }
      }

      if (statusCode !== 200) {
        ctx.status = statusCode;
        ctx.body = {
          code: statusCode,
          message: '登录失效或无权限访问~',
        };
        return;
      }

      await next();
      // 控制器之后执行的逻辑
    };
  }
}
