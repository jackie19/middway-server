import { Config, Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { CacheManager } from '@midwayjs/cache';
import { Repository } from 'typeorm';
import * as md5 from 'md5';
import * as jwt from 'jsonwebtoken';

import { BaseSysUserEntity } from '../entity/user';
import { BaseService } from '../core/service/base';
import { LoginDTO } from '../dto/login';

@Provide()
export class LoginService extends BaseService {
  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @Config()
  jwt;
  @Inject()
  cache: CacheManager;

  async login(data: LoginDTO) {
    const { username, password } = data;
    const user = await this.baseSysUserEntity.findOne({ username });
    if (user) {
      // 校验用户状态及密码
      if (user.status === 0 || user.password !== md5(password)) {
        throw new Error('用户名或密码不正确~');
      }
    } else {
      throw new Error('用户名或密码不正确~');
    }

    const roleIds = ['admin'];
    const { expire, refreshExpire } = this.jwt.token;
    const result = {
      expire,
      token: await this.generateToken(user, roleIds, expire),
      refreshExpire,
      refreshToken: await this.generateToken(
        user,
        roleIds,
        refreshExpire,
        true
      ),
    };

    await this.cache.set(`token:${username}`, result.token, {
      ttl: result.expire,
    });

    return result;
  }

  /**
   * 生成token
   * @param user 用户对象
   * @param roleIds 角色集合
   * @param expire 过期
   * @param isRefresh 是否是刷新
   */
  async generateToken(user, roleIds, expire, isRefresh?) {
    const tokenInfo = {
      isRefresh: false,
      roleIds,
      username: user.username,
      userId: user.id,
      passwordVersion: user.passwordV,
    };
    if (isRefresh) {
      tokenInfo.isRefresh = true;
    }
    return jwt.sign(tokenInfo, this.jwt.secret, {
      expiresIn: expire,
    });
  }
}
