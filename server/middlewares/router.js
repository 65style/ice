import Router from 'koa-router'
import config from '../config'
import reply from '../wechat/reply'
import wechatMiddle from '../wechat-lib/middleware'
import { resolve } from 'path'

export const router = app => {
  const router = new Router()
  
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))

  router.get('/upload', async (ctx, next) => {
    let mp = require('../wechat')
    let client = mp.getWechat()
    // // 临时图片素材
    // const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../../ice.jpeg'))
    // // 临时视频素材
    // const data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../../ice.mp4'))
    // // 永久图片素材
    // const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../../ice.jpeg'), {type: 'image'})
    // // 永久视频素材
    // const data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../../ice.mp4'), {type: 'video', description: '{"title": "哈哈", "introduction": "嘿嘿"}'})
    // // 永久图文素材
    const news = {
      "articles": [
        {
          "title": 'liyangming',
          "thumb_media_id": 'qNw4WD6Qn33thXCO_D0L7vjknVepPyEavROrPi0erQI',
          "author": '65style',
          "digest": '没有摘要',
          "show_cover_pic": 1,  // 是否显示封面，0为false，即不显示，1为true，即显示
          "content": '没有内容',
          "content_source_url": 'http://65style.com',
          "need_open_comment":1,  // Uint32 是否打开评论，0不打开，1打开
          "only_fans_can_comment":1 // Uint32 是否粉丝才可评论，0所有人可评论，1粉丝才可评论
        },
        {
          "title": 'liyangming2',
          "thumb_media_id": 'qNw4WD6Qn33thXCO_D0L7vjknVepPyEavROrPi0erQI',
          "author": '65style',
          "digest": '没有摘要2',
          "show_cover_pic": 0,  // 是否显示封面，0为false，即不显示，1为true，即显示
          "content": '没有内容2',
          "content_source_url": 'http://65style.com',
          "need_open_comment":1,  // Uint32 是否打开评论，0不打开，1打开
          "only_fans_can_comment":1 // Uint32 是否粉丝才可评论，0所有人可评论，1粉丝才可评论
        },
      //若新增的是多图文素材，则此处应还有几段articles结构
      ]
    }
    
    const data = await client.handle('uploadMaterial', 'news', news, {})

    console.log(data)
  })

  // router.get('/fetch', async (ctx, next) => {
  //   let mp = require('../wechat')
  //   let client = mp.getWechat()

  //   const data = await client.handle('fetchMetarial', 'qNw4WD6Qn33thXCO_D0L7sfYL11tptEgE-ufZZpZS4w', 'news', {})
  //   console.log(data)
  // })
  app
    .use(router.routes())
    .use(router.allowedMethods())
}