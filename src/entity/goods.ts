import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from '../core/entity/base';
import { EntityValidator, Rules } from '../core/entity.validator';

/**
 * 商品
 */
@EntityValidator()
@EntityModel('demo_app_goods')
export class DemoAppGoodsEntity extends BaseEntity {
  @Rules([
    { required: true, message: '请输入标题' },
    {
      message: '标题不能超过10个字符',
      validator: (val: string) => val.length <= 10,
    },
  ])
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '图片' })
  pic: string;

  @Rules([
    {
      message: '价格不能超过100',
      validator: (val: number) => val <= 100,
    },
  ])
  @Column({ comment: '价格', type: 'decimal', precision: 5, scale: 2 })
  price: number;

  @Column({ comment: '分类', type: 'tinyint' })
  type: number;
}
