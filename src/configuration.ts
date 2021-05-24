import {
  App,
  attachClassMetadata,
  attachPropertyDataToClass,
  Config,
  Configuration,
  CONTROLLER_KEY,
  getClassMetadata,
  listModule,
  Logger,
  RouteParamTypes,
  RULES_KEY,
  savePropertyMetadata,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
// eslint-disable-next-line node/no-extraneous-import
import { ILogger } from '@midwayjs/logger';
import * as orm from '@midwayjs/orm';
import { joinURLPath } from '@midwayjs/core/dist/util';
import * as swagger from '@midwayjs/swagger';
import * as cache from '@midwayjs/cache';
import * as bodyParser from 'koa-bodyparser';
import { Application } from 'egg';
import { join } from 'path';
import * as Joi from 'joi';
import { BaseService } from './core/service/base';
import { BaseController } from './core/controller/base';
import { DeleteEntity, ListEntity, PageEntity } from './core/entity/base';
import { APIS, Method } from './core/constants/global';

function getMetadataValue(url, entity) {
  switch (url) {
    case 'add':
      return [entity, String];
    case 'delete':
      return [DeleteEntity, String];
    case 'list':
      return [ListEntity, String];
    case 'page':
      return [PageEntity, String];
    case 'update':
      return [entity, String, String];
    case 'info':
      return [String, String, String];
  }
}

function convertProperties(example, properties = null) {
  if (!example && !properties) {
    return undefined;
  }
  if (!properties) {
    properties = {};
    const exampleKeys = Object.keys(example);
    for (let i = 0; i < exampleKeys.length; i++) {
      const value = example[exampleKeys[i]];
      const valueType = typeof value;
      switch (valueType) {
        case 'boolean':
        case 'number':
        case 'string':
          properties[exampleKeys[i]] = {
            type: valueType,
          };
          break;
        case 'object':
          if (Array.isArray(value)) {
            properties[exampleKeys[i]] = {
              type: 'array',
              items: {
                type: typeof value,
                properties: convertProperties(value[0]),
              },
            };
          } else {
            properties[exampleKeys[i]] = {
              type: 'object',
              properties: convertProperties(example[exampleKeys[i]]),
            };
          }
          break;
        default:
          break;
      }
    }
  }
  return properties;
}
function convertExample(example, respondType) {
  if (example === null || example === undefined) {
    return undefined;
  }
  switch (respondType) {
    case 'object':
    case 'json':
    case 'boolean':
    case 'number':
      return example;
  }
  return example.toString();
}

function saveSwaggerResponse(target, propertyKey, options) {
  savePropertyMetadata(
    swagger.SWAGGER_DOCUMENT_KEY,
    {
      params: [],
      response: [
        {
          status: 200,
          description: '',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: convertProperties(
                  options.example,
                  options.properties
                ),
                example: convertExample(options.example, 'json'),
              },
            },
          },
        },
      ],
    },
    target,
    propertyKey
  );
}

@Configuration({
  imports: [orm, swagger, cache],
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

  attachPropertyDataToClass({ data, crudModule, propertyName }) {
    // data.index 为 controller 方法参数类型元数据
    // data:
    // {
    //         index,
    //         type,
    //         propertyData,
    //       },
    attachPropertyDataToClass(
      WEB_ROUTER_PARAM_KEY,
      data,
      crudModule,
      propertyName
    );
  }

  addToken2Header(crudModule, propertyName) {
    this.attachPropertyDataToClass({
      crudModule,
      propertyName,
      data: {
        index: 1,
        type: RouteParamTypes.HEADERS,
        propertyData: 'token',
      },
    });
  }

  addIdParam(url, crudModule, propertyName) {
    if (url === APIS.UPDATE || url === APIS.INFO) {
      this.attachPropertyDataToClass({
        data: {
          type: RouteParamTypes.QUERY,
          index: 2,
          propertyData: 'id',
        },
        crudModule,
        propertyName,
      });
    }
  }

  postApiAddBody(method, crudModule, propertyName) {
    if (method === Method.post) {
      this.attachPropertyDataToClass({
        data: {
          index: 0,
          type: RouteParamTypes.BODY,
          propertyData: '',
        },
        crudModule,
        propertyName,
      });
    }
  }

  configSwagger({ url, prefix, entity, method, middleware, crudModule }) {
    const propertyName = (prefix + url).replace(/\//g, '');
    crudModule.prototype[propertyName] = () => {};

    // 获取方法参数类型
    const metadataValue = getMetadataValue(url, entity);
    // 给controller添加元数据
    // swagger 读取元数据
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

    let properties = undefined;
    const options = {
      example: {
        code: 200,
        message: 'success',
        data: {},
      },
      properties,
    };
    if ([APIS.INFO, APIS.LIST, APIS.PAGE].includes(url)) {
      properties = getClassMetadata(swagger.SWAGGER_DOCUMENT_KEY, entity);
      options.properties = properties;
      for (const propertyName in properties) {
        options.example.data[propertyName] = properties[propertyName].example;
      }
    }
    saveSwaggerResponse(crudModule, propertyName, options);

    this.postApiAddBody(method, crudModule, propertyName);
    this.addToken2Header(crudModule, propertyName);
    this.addIdParam(url, crudModule, propertyName);
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
          const method = url === APIS.INFO ? Method.get : Method.post;
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
                    this.validateParams(entity, requestParams, url);
                    break;
                  case 'update':
                    requestParams.id = ctx.request.query.id;
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
    if (url === APIS.UPDATE) {
      rules = {
        ...rules,
        id: Joi.string().required(),
      };
    }
    const schema = Joi.object(rules);
    const result = schema.validate(params);
    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}
