import { EntityModel } from '@midwayjs/orm';
import { Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../core/entity/base';
import { EntityValidator, Rules } from '../core/entity.validator';
import { DemoAppGoodsEntity } from './goods';

/**
 * 会员
 */

@EntityValidator()
@EntityModel('demo_app_members')
export class DemoAppMemEntity extends BaseEntity {
  @Rules([{ required: true, message: '请输入用户名' }])
  @Column({ comment: '用户名' })
  username: string;

  @OneToMany(() => DemoAppGoodsEntity, goods => goods.member)
  goods: DemoAppGoodsEntity[];
}
