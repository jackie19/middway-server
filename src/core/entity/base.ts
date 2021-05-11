import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn({ comment: 'ID' })
  id: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: string;

  @CreateDateColumn({ comment: '更新时间' })
  updateTime: string;
}
