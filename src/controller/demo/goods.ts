import { Provide } from '@midwayjs/decorator';
import { IController } from '../../core/decorator/controller';
import { DemoAppGoodsEntity } from '../../entity/goods';
import { APIS } from '../../core/constants/global';
import { WhereItem } from '../../core/interface/base';

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
  info,
  queryOption: {
    // 增加 sql select
    select: ['category.name as category_name', 'category.id as category_id'],
    leftJoinAndSelect: ['a.category', 'category'],
    // 模糊查询
    keywordLikeFields: ['title'],
    // 完全匹配
    fieldEq: ['title'],
    // leftJoin: [
    //   {
    //     entity: DemoAppCategoryEntity,
    //     alias: 'b',
    //     selects: ['b.name'],
    //     condition: 'a.memberId = b.id',
    //   },
    // ],
    // 筛选条件
    where: async ctx => {
      const { categoryName, price = 0 } = ctx.request.body;

      const result: WhereItem[] = [
        // 价格大于
        ['a.price > :price', { price }],
      ];
      // 查分类
      if (categoryName) {
        result.push(['category.name in (:name)', { name: categoryName }]);
      }
      return result;
    },
  },
})
export class TestController {}
