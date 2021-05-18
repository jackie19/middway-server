import { EntityModel } from '@midwayjs/orm';
import { Column, ManyToMany } from 'typeorm';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/decorator';
import { BaseEntity } from '../core/entity/base';
import { DemoAppCategoryEntity } from './category';

/**
 * 商品
 */
@EntityModel('demo_app_goods')
export class DemoAppGoodsEntity extends BaseEntity {
  @CreateApiPropertyDoc('标题', {
    example: '华为荣耀',
  })
  @Rule(RuleType.string().required().max(10))
  @Column({ comment: '标题' })
  title: string;

  @CreateApiPropertyDoc('图片', { example: 'abc' })
  @Rule(RuleType.string().required().max(100))
  @Column({ comment: '图片' })
  pic: string;

  @CreateApiPropertyDoc('价格', { example: 99 })
  @Rule(RuleType.number().required().max(100))
  @Column({ comment: '价格', type: 'decimal', precision: 5, scale: 2 })
  price: number;

  @CreateApiPropertyDoc('分类', {
    description: '产品分类',
    example: { id: 1, name: 'electron' },
  })
  // 配合 CreateApiPropertyDoc 生成文档
  @Rule(RuleType.object())
  @ManyToMany(() => DemoAppCategoryEntity, category => category.goods, {
    cascade: true,
  })
  category;
}
