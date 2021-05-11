import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { EntityValid } from '../core/entity/entity.valid';
import { BaseEntity } from '../core/entity/base';

const valid = new EntityValid('demo_app_goods');
/**
 * 商品
 */

@valid.registerEntity()
@EntityModel('demo_app_goods')
export class DemoAppGoodsEntity extends BaseEntity {
  @valid.rules([
    {
      message: '标题不能超过10个字符',
      validator(val: string) {
        return val.length <= 10;
      },
    },
  ])
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '图片' })
  pic: string;

  @Column({ comment: '价格', type: 'decimal', precision: 5, scale: 2 })
  price: number;

  @Column({ comment: '分类', type: 'tinyint' })
  type: number;
}
