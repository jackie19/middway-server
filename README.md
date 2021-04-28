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
- 临时方案: 微信 access_token 本地文件缓存
    - todo redis 缓存token
- 微信后台接入接口 GET /api/wechat/index
- 微信消息接口 POST /api/wechat/index
- 微信菜单创建接口 GET /api/wechat/menu
- web登录获取openid GET /api/wechat/login
- jssdk 签名接口 GET /api/wechat/jssdk/sign
- 取用户信息 GET /api/user
- 保存用户信息 POST /api/user
- banner GET /api/banner

