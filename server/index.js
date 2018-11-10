import Koa from 'koa'
import { Nuxt, Builder } from 'nuxt'
import R from 'ramda'
import { resolve } from 'path'

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env === 'production')

const r = path => resolve(__dirname, path)
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const MIDDLEWARES = ['database', 'router']

class Server {
  constructor () {
    this.app = new Koa()
    this.useMiddleWares(this.app)(MIDDLEWARES) // 中间件
  }
  // R.map 数组的每个成员依次执行某个函数
  // R.compose 将多个函数合并成一个函数，从右到左执行, 右侧函数的输出作为左侧函数的输入
  useMiddleWares (app) {
    return R.map(R.compose(
      R.map(i => i(app)),               // 传入 app
      require,                          // 引入模块
      i => `${r('./middlewares')}/${i}` // 拿到路径 ./middlewares/router
    ))
  }
  
  async start () {
  
    // Instantiate nuxt.js
    const nuxt = new Nuxt(config)
  
    // Build in development
    if (config.dev) {
      const builder = new Builder(nuxt)
      await builder.build()
    }
  
    this.app.use(async (ctx, next) => {
      await next()
      ctx.status = 200 // koa defaults to 404 when it sees that status is unset
      return new Promise((resolve, reject) => {
        ctx.res.on('close', resolve)
        ctx.res.on('finish', resolve)
        nuxt.render(ctx.req, ctx.res, promise => {
          // nuxt.render passes a rejected promise into callback on error.
          promise.then(resolve).catch(reject)
        })
      })
    })
  
    this.app.listen(port, host)
    console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
  }
}

const app = new Server()

app.start()
