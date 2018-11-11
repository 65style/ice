const tip = '我的卡丽熙， 欢迎来到河间地\n' + 
  '点击 <a href="http://www.baidu.com">一起搞事情吧</a>'

export default async (ctx, netx) => {
  const message = ctx.weixin
  console.log(message)
  if (message.MsgType === 'event') {
    if(message.Event === 'subscribe') {   // 关注事件
      ctx.body = '欢迎关注'
    } else if (message.Event === 'unsubscribe') { // 取消关注事件
      console.log('取消关注了')
    } else if (message.Event === 'LOCATION') {  // 上报地理位置事件
      ctx.body = '纬度：' + message.Latitude + ' 经度：' + message.Longitude + ' 精度：' + message.Precision
    }
  } else if (message.MsgType === 'text') {
    ctx.body = message.Content
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