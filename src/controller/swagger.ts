import { Get, Provide, Inject, Param } from '@midwayjs/decorator';
import { safeRequire } from '@midwayjs/core';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { IController, routerPrefix } from '../core/decorator/controller';
import { BaseController } from '../core/controller/base';

@Provide()
@IController('/swagger')
export class SwaggerController extends BaseController {
  swaggerUiAssetPath: string;

  @Inject('swagger:swaggerGenerator')
  swaggerGenerator;

  constructor() {
    super();
    const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
    this.swaggerUiAssetPath = getAbsoluteFSPath();
  }

  @Get('/ui/:fileName')
  @Get('/ui/')
  async renderSwagger(@Param() fileName: string) {
    if (!this.swaggerUiAssetPath) {
      return 'please run "npm install swagger-ui-dist" first';
    }
    if (!fileName) {
      fileName = '/index.html';
    }

    const resourceAbsolutePath = join(this.swaggerUiAssetPath, fileName);

    if (extname(fileName)) {
      // 7 天内使用缓存
      this.ctx.type = extname(fileName);
      this.ctx.set('cache-control', 'public, max-age=604800');
    }

    if (fileName.indexOf('index.html') !== -1) {
      const htmlContent = this.getSwaggerUIResource(
        resourceAbsolutePath,
        'utf-8'
      );
      return htmlContent.replace(
        'https://petstore.swagger.io/v2/swagger.json',
        `/${routerPrefix}/swagger/json`
      );
    } else {
      return this.getSwaggerUIResource(resourceAbsolutePath);
    }
  }

  @Get('/json')
  async renderJSON() {
    return this.swaggerGenerator.generate();
  }

  getSwaggerUIResource(requestPath, encoding?: 'utf-8') {
    return readFileSync(requestPath, {
      encoding,
    });
  }
}
