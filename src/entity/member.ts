import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from '../core/entity/base';
import { EntityValidator, Rules } from '../core/entity.validator';

/**
 * 会员
 */

@EntityValidator()
@EntityModel('demo_app_members')
export class DemoAppMemEntity extends BaseEntity {
  @Rules([{ required: true, message: '请输入用户名' }])
  @Column({ comment: '用户名' })
  username: string;
}
