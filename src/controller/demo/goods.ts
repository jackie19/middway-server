import { App, Provide } from '@midwayjs/decorator';
import { Application } from 'egg';
import { IController } from '../../core/decorator/controller';
import { DemoAppGoodsEntity } from '../../entity/goods';
import { DemoAppCategoryEntity } from '../../entity/category';
import { APIS } from '../../core/constants/global';

const add = (params, entityInstance) => {
  if (params.category) {
    const category = new DemoAppCategoryEntity();
    Object.assign(category, params.category);
    entityInstance.category = [category];
  }
};

const info = async (ctx, app) => {
  return {
    relations: ['category'],
    adapter: data => {
      data.category = data.category.map(({ id, name }) => ({ id, name }));
      return data;
    },
  };
};

@Provide()
@IController('/goods', undefined, {
  api: [APIS.ADD, APIS.INFO, APIS.UPDATE, APIS.LIST, APIS.PAGE, APIS.DELETE],
  entity: DemoAppGoodsEntity,
  add,
  update: add,
  info,
  queryOption: {
    // 增加 sql select
    select: ['category.name as category_name', 'category.id as category_id'],
    leftJoinAndSelect: ['a.category', 'category'],
    // 模糊查询
    keywordLikeFields: ['title'],
    // 完全匹配
    fieldEq: ['type'],
    // leftJoin: [
    //   {
    //     entity: DemoAppCategoryEntity,
    //     alias: 'b',
    //     selects: ['b.name'],
    //     condition: 'a.memberId = b.id',
    //   },
    // ],
    // 筛选条件
    where: async () => {
      return [
        // 价格大于10
        ['a.price > :price', { price: 10 }],
      ];
    },
  },
})
export class TestController {
  @App()
  app: Application;
}
