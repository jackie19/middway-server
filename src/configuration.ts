import {
  App,
  Configuration,
  Logger,
  Config,
  listModule,
  CONTROLLER_KEY,
  getClassMetadata,
  RULES_KEY,
} from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
// eslint-disable-next-line node/no-extraneous-import
import { ILogger } from '@midwayjs/logger';
import * as orm from '@midwayjs/orm';
import { joinURLPath } from '@midwayjs/core/dist/util';
import * as bodyParser from 'koa-bodyparser';
import { Application } from 'egg';
import { join } from 'path';
import { BaseService } from './core/service/base';
import { BaseController } from './core/controller/base';
import { validate } from './core/entity.validator/';

@Configuration({
  imports: [orm],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle extends BaseController implements ILifeCycle {
  @App()
  app: Application;

  @Logger()
  coreLogger: ILogger;

  @Config('routerPrefix')
  routerPrefix;

  @Config('middleware')
  middlewareConfig;

  async onReady() {
    this.handlerRouterPrefix();
    await this.autoCrud();
  }

  handlerRouterPrefix() {
    if (this.routerPrefix) {
      this.app.use(async (ctx, next) => {
        if (!ctx.path.startsWith(this.routerPrefix)) {
          ctx.status = 404;
          ctx.set('Content-Type', 'text/html; charset=utf-8');
          ctx.body = '<h1>404 Not Found...</h1>';
          return;
        } else {
          ctx.path = ctx.path.replace(this.routerPrefix, '');
        }
        await next();
      });
      this.coreLogger.info(
        `\x1B[36m[configuration] global router prefix:\x1B[0m ${this.routerPrefix}`
      );
    }
  }

  async autoCrud() {
    const crudList = listModule(CONTROLLER_KEY);
    for (const crud of crudList) {
      const {
        crudOptions = {},
        routerOptions = {},
        prefix = '',
      } = getClassMetadata(CONTROLLER_KEY, crud);
      const { entity } = crudOptions;

      if (entity) {
        const entityModel = orm.useEntityModel(entity);
        const {
          api = [],
          queryOption,
          insertParam,
          infoIgnoreProperty,
          service,
        } = crudOptions;
        const middlewares = [];
        let middlewareConfigs = this.middlewareConfig || [];
        middlewareConfigs = middlewareConfigs.concat(routerOptions.middleware);
        middlewareConfigs = Array.from(new Set(middlewareConfigs));
        for (const item of middlewareConfigs) {
          middlewares.push(await this.app['generateMiddleware'](item));
        }
        for (const url of api) {
          const method = url === 'info' ? 'get' : 'post';
          const path = joinURLPath(prefix, url);
          this.coreLogger.info(
            `\x1B[36m[configuration] crud add:  \x1B[0m ${path}`
          );
          this.app.router[method](
            path,
            bodyParser(),
            ...middlewares,
            async ctx => {
              const baseService = (await ctx.requestContext.getAsync(
                service ? service : BaseService
              )) as BaseService;
              baseService.setEntityModel(entityModel);
              baseService.setCtx(ctx);
              const requestParams =
                ctx.req.method === 'GET'
                  ? ctx.request.queries
                  : ctx.request.body;

              if (insertParam) {
                const insertParamData = await insertParam(ctx, this.app);
                for (const key in insertParamData) {
                  requestParams[key] = insertParamData[key];
                }
              }
              ctx.status = 200;
              try {
                switch (url) {
                  case 'add':
                    this.validateParams(entity, requestParams);
                    ctx.body = this.ok(
                      await baseService.add(requestParams, crudOptions)
                    );
                    break;
                  case 'delete':
                    ctx.body = this.ok(
                      await baseService.delete(requestParams.ids)
                    );
                    break;
                  case 'update':
                    this.validateParams(entity, requestParams);
                    ctx.body = this.ok(
                      await baseService.update(requestParams, crudOptions)
                    );
                    break;
                  case 'info':
                    ctx.body = this.ok(
                      await baseService.info(
                        requestParams.id,
                        infoIgnoreProperty
                      )
                    );
                    break;
                  case 'list':
                    ctx.body = this.ok(
                      await baseService.list(requestParams, queryOption)
                    );
                    break;
                  case 'page':
                    ctx.body = this.ok(
                      await baseService.page(requestParams, queryOption)
                    );
                    break;
                }
              } catch (e) {
                ctx.body = this.fail(e.message);
              }
            }
          );
        }
      }
    }
  }

  validateParams(modelClass, params) {
    // 获得校验规则
    const rules = getClassMetadata(RULES_KEY, modelClass);

    const result = validate(rules, params);
    if (!result.success) {
      throw new Error(result.error.messages);
    }
  }
}
