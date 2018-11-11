const tip = '我的卡丽熙， 欢迎来到河间地\n' + 
  '点击 <a href="http://www.baidu.com">一起搞事情吧</a>'

export default async (ctx, netx) => {
  const message = ctx.weixin
  console.log('smddddddddddddd')
  console.log(message)
  ctx.body = tip
}