import { EntityModel } from '@midwayjs/orm';
import { Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../core/entity/base';
import { EntityValidator, Rules } from '../core/entity.validator';
import { DemoAppGoodsEntity } from './goods';

/**
 * 分类
 */

@EntityValidator()
@EntityModel('demo_app_category')
export class DemoAppCategoryEntity extends BaseEntity {
  @Rules([{ required: true, message: '请输入分类名称' }])
  @Column({ comment: '分类名' })
  name: string;

  @ManyToMany(() => DemoAppGoodsEntity, goods => goods.category)
  @JoinTable()
  goods: DemoAppGoodsEntity[];
}
