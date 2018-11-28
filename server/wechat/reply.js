import request from 'request-promise'


const tip = '我的卡丽熙， 欢迎来到河间地\n' + 
  '点击 <a href="http://www.baidu.com">一起搞事情吧</a>'

export default async (ctx, netx) => {
  const message = ctx.weixin
  console.log(message)
  let mp = require('./index')
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
  // const news = {
  //   "articles": [
  //     {
  //       "title": 'liyangming',
  //       "thumb_media_id": 'qNw4WD6Qn33thXCO_D0L7vjknVepPyEavROrPi0erQI',
  //       "author": '65style',
  //       "digest": '没有摘要',
  //       "show_cover_pic": 1,  // 是否显示封面，0为false，即不显示，1为true，即显示
  //       "content": '没有内容',
  //       "content_source_url": 'http://65style.com',
  //       "need_open_comment":1,  // Uint32 是否打开评论，0不打开，1打开
  //       "only_fans_can_comment":1 // Uint32 是否粉丝才可评论，0所有人可评论，1粉丝才可评论
  //     },
  //     {
  //       "title": 'liyangming2',
  //       "thumb_media_id": 'qNw4WD6Qn33thXCO_D0L7vjknVepPyEavROrPi0erQI',
  //       "author": '65style',
  //       "digest": '没有摘要2',
  //       "show_cover_pic": 0,  // 是否显示封面，0为false，即不显示，1为true，即显示
  //       "content": '没有内容2',
  //       "content_source_url": 'http://65style.com',
  //       "need_open_comment":1,  // Uint32 是否打开评论，0不打开，1打开
  //       "only_fans_can_comment":1 // Uint32 是否粉丝才可评论，0所有人可评论，1粉丝才可评论
  //     },
  //   //若新增的是多图文素材，则此处应还有几段articles结构
  //   ]
  // }
  

  if (message.MsgType === 'event') {
    if(message.Event === 'subscribe') {   // 关注事件
      ctx.body = '欢迎关注'
    } else if (message.Event === 'unsubscribe') { // 取消关注事件
      console.log('取消关注了')
    } else if (message.Event === 'LOCATION') {  // 上报地理位置事件
      ctx.body = '纬度：' + message.Latitude + ' 经度：' + message.Longitude + ' 精度：' + message.Precision
    }
  } else if (message.MsgType === 'text') {
    const msg = message.Content
    const reg = /^1(3|4|5|7|8)\d{9}$/
    console.log(reg.test(msg))
    if (reg.test(msg)) {
      const telAddress = await client.handleCustomize('getTelAddress', msg)
      console.log(telAddress)
      ctx.body = telAddress.data.province + ' - ' + telAddress.data.city + ' - ' + telAddress.data.sp
    } else {

      // if (message.Content === '1') {
  
      //   const data = await client.handle('getUserInfo', 'oTJAh0-dgmvXWzMG998T7JXRI27w')
  
      //   console.log(data)
      // }
      // ctx.body = message.Content
    }
  } else if (message.MsgType === 'image') {
    ctx.body = {
      type: 'image',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'voice') {
    ctx.body = {
      type: 'voice',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'video') {
    ctx.body = {
      type: 'video',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'shortvideo') {
    ctx.body = {
      type: 'video',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'location') {
    ctx.body = '我们在同一个地球哟！您在：' + message.Label + '\n维度：' + message.Location_X + '经度：' + message.Location_Y
  } else if (message.MsgType === 'link') {
    ctx.body = [{
      title: message.Title,
      description: message.Description,
      picUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/t4Q9tl3uGI8zEmPB8UTVJ8zIXC1GAvMZPtFDXdudPytOia7mWxbrboD0tNwnewiaBqC42XeAnU81AbtFKnMjAS6g/0',
      url: message.url
    }]
  }
}