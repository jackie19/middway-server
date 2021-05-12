# my-midway-project

## QuickStart

<!-- add docs here for user -->

see [midway docs][midway] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.


[midway]: https://midwayjs.org

### feature
- fs 缓存模块
    - todo redis 缓存
- 微信后台接入接口 GET /api/wechat/index
- 微信消息接口 POST /api/wechat/index
- 微信菜单创建接口 GET /api/wechat/menu
- web登录获取openid GET /api/wechat/login
- jssdk 签名接口 GET /api/wechat/jssdk/sign
- 取用户信息 GET /api/user
- 保存用户信息 POST /api/user
- banner GET /api/banner
- 配置全局路由前缀
- 装饰器IController生成增删改查接口
    - todo
- 实体验证装饰器 entity.validator

### todo
- oss 文件上传签名
- 实体导出 schema 接口
- swagger
- 微信支付
- jwt 鉴权



