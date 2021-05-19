import { EntityModel } from '@midwayjs/orm';
import { Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';
import { BaseEntity } from '../core/entity/base';
import { DemoAppGoodsEntity } from './goods';

/**
 * 分类
 */

@EntityModel('demo_app_category')
export class DemoAppCategoryEntity extends BaseEntity {
  @CreateApiPropertyDoc('分类名', { example: 'electron' })
  @Index({ unique: true })
  @Column({ comment: '分类名' })
  name: string;

  @ManyToMany(() => DemoAppGoodsEntity, goods => goods.category)
  @JoinTable()
  goods: DemoAppGoodsEntity[];
}
