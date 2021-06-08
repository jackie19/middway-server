import { Provide, App } from '@midwayjs/decorator';
import { Application } from 'egg';
import * as _ from 'lodash';
import { Brackets, Repository } from 'typeorm';
import { ERRINFO } from '../constants/global';
import { IQueryOption } from '../interface/base';
import { SchemaService } from './schema';

@Provide()
export class BaseService extends SchemaService {
  @App()
  app: Application;

  entityModel: Repository<any>;
  ctx = null;

  setEntityModel(entityModel) {
    this.entityModel = entityModel;
  }

  // 设置请求上下文
  setCtx(ctx) {
    this.ctx = ctx;
  }

  async add(param, { entity, add }) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }

    const myEntity = new entity();
    for (const key in param) {
      myEntity[key] = param[key];
    }

    if (add) {
      add(param, myEntity);
    }

    return await this.entityModel.save(myEntity);
  }

  /**
   * 修改
   * @param param 数据
   */
  async update(param, { entity, update }) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    if (!param.id) {
      throw new Error(ERRINFO.NOID);
    }
    const myEntity = new entity();
    for (const key in param) {
      myEntity[key] = param[key];
    }
    if (update) {
      update(param, myEntity);
    }

    myEntity.id = parseInt(myEntity.id, 10);

    return await this.entityModel.save(myEntity);
  }

  /**
   * 删除
   * @param ids 删除的ID集合 如：[1,2,3] 或者 1,2,3
   */
  async delete({ ids }) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    if (ids instanceof Array) {
      await this.entityModel.delete(ids);
    } else {
      await this.entityModel.delete(ids.split(','));
    }
  }

  /*
   * 全量列表查询
   * */
  async list(query, { queryOption: option }) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    const builder = await this.builder(query, option);
    return await builder.getMany();
  }

  async builder(query, option: Partial<IQueryOption>) {
    // eslint-disable-next-line prefer-const
    let { order = 'a.updateTime', sort = 'desc', keyword = '' } = query;
    const find = await this.entityModel.createQueryBuilder('a');
    if (option) {
      if (!_.isEmpty(option.leftJoinAndSelect)) {
        find.leftJoinAndSelect(...option.leftJoinAndSelect);
      }
    }
    // 默认条件
    if (option.where) {
      const wheres = await option.where(this.ctx, this.app);
      if (!_.isEmpty(wheres)) {
        for (const item of wheres) {
          find.andWhere(item[0], item[1]);
        }
      }
    }
    // 关键字模糊搜索
    if (keyword) {
      keyword = `%${keyword}%`;
      find.andWhere(
        new Brackets(qb => {
          const keywordLikeFields = option.keywordLikeFields;
          for (let i = 0; i < option.keywordLikeFields.length; i++) {
            qb.orWhere(`${keywordLikeFields[i]} like :keyword`, {
              keyword,
            });
          }
        })
      );
    }
    // 接口请求的排序
    if (sort && order) {
      const sorts = sort.toUpperCase().split(',');
      const orders = order.split(',');
      if (sorts.length !== orders.length) {
        throw new Error('SORT FIELD');
      }
      for (const i in sorts) {
        find.orderBy(orders[i], sorts[i]);
      }
    }
    // 字段全匹配
    if (!_.isEmpty(option.fieldEq)) {
      for (const key of option.fieldEq) {
        const c = {};
        if (typeof key === 'string') {
          if (query[key] || query[key] === 0) {
            c[key] = query[key];
            const eq = query[key] instanceof Array ? 'in' : '=';
            if (eq === 'in') {
              find.andWhere(`a.${key} ${eq} (:${key})`, c);
            } else {
              find.andWhere(`a.${key} ${eq} :${key}`, c);
            }
          }
        }
      }
    }

    return find;
  }

  /**
   * 分页查询
   * @param query 查询条件
   * @param option 查询配置
   */
  async page(query, { queryOption: option }) {
    const { size = 20, page = 1 } = query;
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    const builder = await this.builder(query, option);

    const content = await builder
      .skip((page - 1) * size)
      .take(size)
      .getMany();
    return {
      content,
      pagination: {
        page: parseInt(page, 10),
        size: parseInt(size, 10),
        total: await builder.getCount(),
      },
    };
  }

  /**
   * 获得单个ID
   * @param id ID
   * @param options
   */
  async info({ id }, options) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    if (!id) {
      throw new Error(ERRINFO.NOID);
    }

    let relations = [];
    let adapter = i => i;

    const { info } = options;
    if (info) {
      const res = await info(this.ctx, this.app);
      relations = res.relations || relations;
      adapter = res.adapter || adapter;
    }

    let data = await this.entityModel.findOne({ id }, { relations });

    if (data) {
      data = adapter(data);
    }

    return data || {};
  }
}
