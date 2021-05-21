import { EntityModel } from '@midwayjs/orm';
import { Column, Index } from 'typeorm';
import { BaseEntity } from '../core/entity/base';

/**
 * 系统用户
 */
@EntityModel('base_sys_user')
export class BaseSysUserEntity extends BaseEntity {
  @Column({ comment: '姓名', nullable: true })
  name: string;

  @Index({ unique: true })
  @Column({ comment: '用户名', length: 100 })
  username: string;

  @Column({ comment: '密码' })
  password: string;

  @Column({
    comment: '密码版本, 作用是改完密码，让原来的token失效',
    default: 1,
  })
  passwordV: number;

  @Column({ comment: '昵称', nullable: true })
  nickName: string;

  @Column({ comment: '头像', nullable: true })
  headImg: string;

  @Index()
  @Column({ comment: '手机', nullable: true, length: 20 })
  phone: string;

  @Column({ comment: '邮箱', nullable: true })
  email: string;

  @Column({ comment: '备注', nullable: true })
  remark: string;

  @Column({ comment: '状态 0:禁用 1：启用', default: 1, type: 'tinyint' })
  status: number;
}
