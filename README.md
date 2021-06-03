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
- 接口
    - 微信后台接入接口 GET /api/wechat/index
    - 微信消息接口 POST /api/wechat/index
    - 微信菜单创建接口 GET /api/wechat/menu
    - web登录获取openid GET /api/wechat/login
    - jssdk 签名接口 GET /api/wechat/jssdk/sign
    - 商品接口,支持多对多
    - 商品分类接口,支持多对多
- 装饰器IController
    - 配置全局路由前缀
    - 生成crud接口
    - 生成 swagger
- nacos
- jwt 鉴权, auth 中间件

### todo
- oss 文件上传签名
- 实体导出 schema 接口
    - 自定义组件
    - 联动 - 自定义组件实现
    - select options 数据
- 微信支付
- core 组件



