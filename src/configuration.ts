import {
  App,
  Configuration,
  Logger,
  Config,
  listModule,
  getClassMetadata,
  attachClassMetadata,
  attachPropertyDataToClass,
  RouteParamTypes,
  RULES_KEY,
  WEB_ROUTER_KEY,
  CONTROLLER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
// eslint-disable-next-line node/no-extraneous-import
import { ILogger } from '@midwayjs/logger';
import * as orm from '@midwayjs/orm';
import { joinURLPath } from '@midwayjs/core/dist/util';
import * as swagger from '@midwayjs/swagger';
import * as bodyParser from 'koa-bodyparser';
import { Application } from 'egg';
import { join } from 'path';
import * as Joi from 'joi';
import { BaseService } from './core/service/base';
import { BaseController } from './core/controller/base';
import { PageEntity, ListEntity, DeleteEntity } from './core/entity/base';

function getMetadataValue(url, entity) {
  switch (url) {
    case 'add':
      return [entity];
    case 'delete':
      return [DeleteEntity];
    case 'list':
      return [ListEntity];
    case 'page':
      return [PageEntity];
    case 'update':
      // fixme 会污染 add 接口
      // class 如何 clone ?
      addPropertyToEntity(entity, 'id');
      return [entity];
    case 'info':
      return [String];
  }
}

function addPropertyToEntity(target, propertyKey) {
  attachClassMetadata(
    swagger.SWAGGER_DOCUMENT_KEY,
    {
      description: 'id',
      type: 'number',
      isBaseType: true,
      originDesign: Number,
    },
    target,
    propertyKey
  );
}

@Configuration({
  imports: [orm, swagger],
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
    // swagger 不能适配全局路由前缀
    // 通过 IController 注入全局路由前缀
    // this.handlerRouterPrefix();
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

  async getMiddleware(routerMiddleware) {
    const middlewares = [];
    let middlewareConfigs = this.middlewareConfig || [];
    middlewareConfigs = middlewareConfigs.concat(routerMiddleware);
    middlewareConfigs = Array.from(new Set(middlewareConfigs));
    for (const item of middlewareConfigs) {
      middlewares.push(await this.app.generateMiddleware(item));
    }
    return middlewares;
  }

  configSwagger({ url, prefix, entity, method, middleware, crudModule }) {
    // 给实体添加元数据
    const propertyName = (prefix + url).replace(/\//g, '');
    crudModule.prototype[propertyName] = () => {};

    const metadataValue = getMetadataValue(url, entity);
    Reflect.defineMetadata(
      'design:paramtypes',
      metadataValue,
      crudModule.prototype,
      propertyName
    );

    // 添加 router 元数据, 提供给swagger读取
    attachClassMetadata(
      WEB_ROUTER_KEY,
      {
        path: `/${url}`,
        requestMethod: method,
        middleware,
        method: propertyName,
      },
      crudModule
    );
    attachPropertyDataToClass(
      WEB_ROUTER_PARAM_KEY,
      {
        index: 0,
        type: url === 'info' ? RouteParamTypes.QUERY : RouteParamTypes.BODY, // query 0, body 1
        propertyData: url === 'info' ? 'id' : '',
      },
      crudModule,
      propertyName
    );
  }

  async autoCrud() {
    const crudModuleList = listModule(CONTROLLER_KEY);
    for (const crudModule of crudModuleList) {
      const {
        crudOptions = {},
        routerOptions = {},
        prefix = '',
      } = getClassMetadata(CONTROLLER_KEY, crudModule);
      const { entity } = crudOptions;

      if (entity) {
        const entityModel = orm.useEntityModel(entity);
        const { api = [], insertParam, service } = crudOptions;
        const middleware = await this.getMiddleware(routerOptions.middleware);

        for (const url of api) {
          const method = url === 'info' ? 'get' : 'post';
          const path = joinURLPath(prefix, url);
          this.coreLogger.info(
            `\x1B[36m[configuration] crud add:  \x1B[0m ${path}`
          );

          this.configSwagger({
            url,
            crudModule,
            entity,
            middleware,
            method,
            prefix,
          });

          this.app.router[method](
            path,
            bodyParser(),
            ...middleware,
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
                  case 'update':
                    this.validateParams(entity, requestParams, url);
                    break;
                }
                ctx.body = this.ok(
                  await baseService[url](requestParams, crudOptions)
                );
              } catch (e) {
                ctx.body = this.fail(e.message);
              }
            }
          );
        }
      }
    }
  }

  validateParams(modelClass, params, url: string) {
    // 获得校验规则
    let rules = getClassMetadata(RULES_KEY, modelClass);
    if (url === 'update') {
      rules = {
        ...rules,
        id: Joi.number().required(),
      };
    }
    const schema = Joi.object(rules);
    const result = schema.validate(params);
    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}
