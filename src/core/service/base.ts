import { Provide, App } from '@midwayjs/decorator';
import { Application } from 'egg';
import * as _ from 'lodash';
import { getManager, Brackets, Repository } from 'typeorm';
import { ERRINFO } from '../constants/global';
import { IQueryOption } from '../decorator/controller';

@Provide()
export class BaseService {
  @App()
  app: Application;

  entityModel: Repository<any>;
  ctx = null;
  sqlParams = [];

  setEntityModel(entityModel) {
    this.entityModel = entityModel;
  }

  // 设置请求上下文
  setCtx(ctx) {
    this.ctx = ctx;
  }

  // 设置应用对象
  setApp(app) {
    this.app = app;
  }

  // 初始化
  init() {
    this.sqlParams = [];
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

    await this.entityModel.save(myEntity);
    return {
      id: param.id,
    };
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

    await this.entityModel.save(param);
  }

  /**
   * 删除
   * @param ids 删除的ID集合 如：[1,2,3] 或者 1,2,3
   */
  async delete(ids) {
    if (!this.entityModel) throw new Error(ERRINFO.NOENTITY);
    if (ids instanceof Array) {
      await this.entityModel.delete(ids);
    } else {
      await this.entityModel.delete(ids.split(','));
    }
  }

  /*
   * 全量列表查询
   * */
  async list(query, option) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    const sql = await this.getOptionFind(query, option);
    return this.nativeQuery(sql, [], undefined);
  }

  /**
   * 分页查询
   * @param query 查询条件
   * @param option 查询配置
   */
  async page(query, option) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    const sql = await this.getOptionFind(query, option);
    return this.sqlRenderPage(sql, query);
  }
  /**
   * 获得单个ID
   * @param id ID
   * @param infoIgnoreProperty 忽略返回属性
   */
  async info(id, infoIgnoreProperty) {
    if (!this.entityModel) {
      throw new Error(ERRINFO.NOENTITY);
    }
    if (!id) {
      throw new Error(ERRINFO.NOID);
    }
    const info = await this.entityModel.findOne({ id });
    if (info && infoIgnoreProperty) {
      for (const property of infoIgnoreProperty) {
        info[property] = undefined;
      }
    }
    return info;
  }
  /**
   * 执行SQL并获得分页数据
   * @param sql 执行的sql语句
   * @param query 分页查询条件
   * @param autoSort 是否自动排序
   * @param connectionName 连接名称
   */
  async sqlRenderPage(sql, query, connectionName = undefined) {
    const { size = 20, page = 1 } = query;
    this.sqlParams.push((page - 1) * size);
    this.sqlParams.push(parseInt(size));
    sql += ' LIMIT ?,? ';
    const params = [...this.sqlParams];
    const list = await this.nativeQuery(sql, params, connectionName);
    const countResult = await this.nativeQuery(
      this.getCountSql(sql),
      params,
      connectionName
    );
    return {
      list,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: parseInt(countResult[0] ? countResult[0].count : 0),
      },
    };
  }

  /**
   * 参数安全性检查
   * @param params
   */
  paramSafetyCheck(params) {
    const lp = params.toLowerCase();
    return !(
      lp.indexOf('update ') > -1 ||
      lp.indexOf('select ') > -1 ||
      lp.indexOf('delete ') > -1 ||
      lp.indexOf('insert ') > -1
    );
  }

  /**
   * 获得查询个数的SQL
   * @param sql
   */
  getCountSql(sql) {
    sql = sql.replace('LIMIT', 'limit');
    return `select count(*) as count from (${sql.split('limit')[0]}) a`;
  }

  async nativeQuery(sql, params, connectionName) {
    if (_.isEmpty(params)) {
      params = this.sqlParams;
    }
    const newParams = [...params];
    this.sqlParams = [];
    return await this.getOrmManager(connectionName).query(sql, newParams);
  }

  getOrmManager(connectionName) {
    return getManager(connectionName);
  }

  async getOptionFind(query, option: IQueryOption) {
    // eslint-disable-next-line prefer-const
    let { order = 'a.createTime', sort = 'desc', keyword = '' } = query;
    const sqlArr = ['SELECT'];
    let selects = ['a.*'];
    const find = this.entityModel.createQueryBuilder('a');
    if (option) {
      if (!_.isEmpty(option.leftJoinAndSelect)) {
        find.leftJoinAndSelect(...option.leftJoinAndSelect);
      }
      // 判断是否有关联查询，有的话取个别名
      if (!_.isEmpty(option.leftJoin)) {
        for (const item of option.leftJoin) {
          selects = selects.concat(item.selects);
          find.leftJoin(item.entity, item.alias, item.condition);
        }
      }
      // 默认条件
      if (option.where) {
        const wheres = await option.where(this.ctx, this.app);
        if (!_.isEmpty(wheres)) {
          for (const item of wheres) {
            for (const key in item[1]) {
              this.sqlParams.push(item[1][key]);
            }
            find.andWhere(item[0], item[1]);
          }
        }
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
              this.sqlParams.push(keyword);
            }
          })
        );
      }
      // 筛选字段
      if (!_.isEmpty(option.select)) {
        sqlArr.push([...selects, ...option.select].join(','));
        find.select(option.select);
      } else {
        sqlArr.push(selects.join(','));
      }
      // 字段全匹配
      if (!_.isEmpty(option.fieldEq)) {
        for (const key of option.fieldEq) {
          const c = {};
          // 单表字段无别名的情况下操作
          if (typeof key === 'string') {
            if (query[key] || query[key] === 0) {
              c[key] = query[key];
              const eq = query[key] instanceof Array ? 'in' : '=';
              if (eq === 'in') {
                find.andWhere(`${key} ${eq} (:${key})`, c);
              } else {
                find.andWhere(`${key} ${eq} :${key}`, c);
              }
              this.sqlParams.push(query[key]);
            }
          } else {
            if (query[key.column] || query[key.column] === 0) {
              c[key.column] = query[key.column];
              const eq = query[key.column] instanceof Array ? 'in' : '=';
              if (eq === 'in') {
                find.andWhere(`${key.column} ${eq} (:${key.column})`, c);
              } else {
                find.andWhere(`${key.column} ${eq} :${key.column}`, c);
              }
              this.sqlParams.push(query[key.column]);
            }
          }
        }
      }
    } else {
      sqlArr.push(selects.join(','));
    }
    const sqls = find.getSql().split('FROM');
    sqlArr.push('FROM');
    sqlArr.push(sqls[1]);
    return sqlArr.join(' ');
  }
}
