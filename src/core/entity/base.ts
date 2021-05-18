import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/decorator';
import * as Joi from 'joi';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ comment: 'ID' })
  id: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: string;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: string;
}

export class PageEntity {
  @CreateApiPropertyDoc('分页', {
    example: 20,
  })
  size: number;

  @CreateApiPropertyDoc('页码', {
    example: 1,
  })
  page: number;
}

export class ListEntity {}

export class DeleteEntity {
  @CreateApiPropertyDoc('ids', {
    example: [1],
  })
  @Rule(RuleType.array().items(Joi.number()))
  ids;
}
