import request from 'request-promise'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential'
}

class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken

    this.fetchAccessToken() // 初始化 Token
  }

  async request(options) {  // 发请求的
    options = Object.assign({}, options, {json: true})
    
    try {
      const response = await request(options)
      console.log(response)
      return response
    } catch (error) {
      console.error(error)
    }

  }

  async fetchAccessToken () { // 比对是否是合法的Token
    let data = await this.getAccessToken()

    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken()
    }

    await this.saveAccessToken(data)

    return data
  }

  async updateAccessToken () {
    const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSectet
    const data = await this.request({url: url})
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn
    return data
  }

  isValidAccessToken (data) {
    if (!date || !data.accessToken || !data.expires_in) {
      return false
    }

    const expiresIn = data.expires_in   // 过期时间
    const now = (new Date().getTime())  // 当前时间

    if (now < expiresIn) {
      return true
    } else {
      return false
    }
  }
}