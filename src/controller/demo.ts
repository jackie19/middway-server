import { Get, Provide, App } from '@midwayjs/decorator';
import { Application } from 'egg';
import { IController } from '../lib/decorator/controller';
import { DemoAppGoodsEntity } from '../entity/goods';

@Provide()
@IController('/test', undefined, {
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DemoAppGoodsEntity,
  queryOption: {
    // 模糊查询
    keywordLikeFields: ['title'],
    // 完全匹配
    fieldEq: ['type'],
    // 排序
    orderBy: {
      price: 'DESC',
    },
    // 筛选条件
    where: async () => {
      return [
        // 满足条件才会执行
        // ['a.price > :price', { price: 90.0 }, '条件'],
      ];
    },
  },
})
export class TestController {
  @App()
  app: Application;

  @Get('/menu')
  async getMenu() {
    return {
      aa: 1,
    };
  }
}
