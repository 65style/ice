import request from 'request-promise'
import iconv from 'iconv-lite'
import formstream from 'formstream'
import fs from 'fs'
import * as _ from 'lodash'
import path from 'path'

// const Iconv = require('iconv').Iconv
// const iconv = new Iconv('GBK', 'UTF-8')


const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential',
  temporary: {                              // 临时素材
    upload: base + 'media/upload?',
    fetch: base + 'media/get?'
  },
  permanent: {                                    // 永久素材
    upload: base + 'material/add_material?',      // 新增其他类型永久素材
    uploadNews: base + 'material/add_news?',      // 新增永久图文素材
    uploadNewsPic: base + 'media/uploadimg?',     // 上传图文消息内的图片获取URL
    fetch: base + 'material/get_material?',       // 获取永久素材
    del: base + 'material/del_material?',         // 删除永久素材
    update: base + 'material/update_news?',       // 修改永久图文素材
    count: base + 'material/get_materialcount?',  // 获取素材总数
    batch: base + 'material/batchget_material?'   // 获取素材列表
  },
  tag: {
    create: base + 'tags/create?',                      // 创建标签
    fetch: base + 'tags/get?',                          // 获取公众号已创建的标签
    update: base + 'tags/update?',                      // 编辑标签                  
    delete: base + 'tags/delete?',                      // 删除标签
    fetchTagUsers: base + 'user/tag/get?',                 // 获取标签下粉丝列表
    batchTag: base + 'tags/members/batchtagging?',      // 批量为用户打标签
    batchUntag: base + 'tags/members/batchuntagging?',  // 批量为用户取消标签
    getTagList: base + 'tags/getidlist?'                // 获取用户身上的标签列表
  },
  user: {
    remark: base + 'user/info/updateremark?',                   // 设置用户备注名
    info: base + 'user/info?',                                  // 获取用户基本信息
    bathcInfo: base + 'user/info/batchget?',                    // 批量获取用户基本信息
    fetchUserList: base + 'user/get?',                          // 获取用户列表
    fetchBlackList: base + 'tags/members/getblacklist?',        // 获取公众号的黑名单列表
    batchBlackList: base + 'tags/members/batchblacklist?',      // 拉黑用户
    bathcUnBlackList: base + 'tags/members/batchunblacklist?'   // 取消拉黑用户    
  }
}

// 读取文件大小方法
function stat (filepath) {
  return new Promise((resolve, reject) => {

  })
}


export default class Wechat {
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
    console.log(99999999)
    const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret

    const data = await this.request({url: url})
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn
    return data
  }

  isValidAccessToken (data) {
    if (!data || !data.accessToken || !data.expires_in) {
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

  async handle (operation, ...args) {

    const options = this[operation](tokenData.access_token, ...args)
    console.log(options)
    console.log(33333)
    const data = await this.request(options)
    
    return data
  }

  /**
   * 处理自定义方法
   * @param  {...any} args 
   */
  async handleCustomize (operation, ...args) {
    console.log(1111)
    const tokenData = await this.fetchAccessToken()
    console.log(tokenData)
    console.log(2222)
    const options = this[operation](...args)
    console.log(options)
    console.log(3333333)
    const data = await this.request(options)
    console.log(data)
    return data
  }

  /**
   * 上传素材
   * @param {String} token 
   * @param {Stiing} type 
   * @param {*} material 
   * @param {*} permanent 标示是否是永久素材
   */
  uploadMaterial (token, type, material, permanent) {
    let form = {}
    let url = api.temporary.upload

    if (permanent) {  // 永久素材
      url = api.permanent.upload

      _.extend(form, permanent)
    }

    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    }

    if (type === 'news') {  // 图文素材
      url = api.permanent.uploadNews
      form = material
    } else {  // 不是图文类型的素材
      form.media = fs.createReadStream(material)
    }

    let uploadUrl = url + 'access_token=' + token
    if (!permanent) {
      uploadUrl += '&type=' + type
    } else {
      if (type !== 'news') {
        form.access_token = token
      }
    }

    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }

    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }

    return options
  }

  /**
   * 获取素材
   * @param {String} token 
   * @param {String} mediaId // 哪一个素材
   * @param {String} type  // 哪一种素材
   * @param {*} permanent // 临时还是永久素材
   */
  fetchMetarial (token, mediaId, type, permanent) {
    let form = {}
    let fetchUrl = permanent ? api.permanent.fetch : api.temporary.fetch
    
    let url = fetchUrl + 'access_token=' + token
    let options = {method: 'POST', url: url}

    if (permanent) {
      form.media_id = mediaId
      form.access_token = token
      options.body = form
    } else {
      if (type === 'video') {
        url = url.replace('https://', 'http://')
      }

      url += '&media_id=' + mediaId
    }
    
    return options
  }

  /**
   * 删除素材
   * @param {String} token 
   * @param {String} mediaId 
   */
  deleteMaterial (token, mediaId) {
    const form = {
      media_id: mediaId
    }
    const url = api.permanent.del + 'access_token=' + token + '&media_id=' + mediaId

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 更新素材
   * @param {*} token 
   * @param {*} mediaId 
   * @param {*} news 
   */
  updateMaterial (token, mediaId, news) {
    const form = {
      media_id: mediaId
    }

    _.extend(form, news)
    const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取素材总数
   * @param {*} token 
   */
  countMaterial (token) {
    const url = api.permanent.count + 'access_token' + token

    return {method: 'GET', url: url}
  }

  /**
   * 获取素材列表
   * @param {*} token 
   * @param {*} options 
   */
  batchMaterial (token, options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10

    const url = api.permanent.batch + 'access_token=' + token

    return {method: 'POST', url: url, body: options}

  } 

  /**
   * 创建标签
   * @param {*} token 
   * @param {*} name // 标签名
   */
  createTag (token, name) {
    const form = {
      tag: {
        name: name
      }
    }
    const url = api.tag.create + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取公众号已创建的标签
   * @param {*} token 
   */
  fetchTags (token) {
    const url = api.tag.fetch + 'access_token=' + token

    return {url: url} // 默认不写 method 就是 get 请求
  }

  /**
   * 编辑标签
   * @param {*} token 
   * @param {*} tagId 
   * @param {*} name 
   */
  updateTag (token, tagId, name) {
    const form = {
      tag: {
        id: tagId,
        name: name
      }
    }
    const url = api.tag.update + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 删除标签
   * @param {*} token 
   * @param {*} tagId 
   */
  deleteTag (token, tagId) {
    const form = {
      tag: {
        id: tagId
      }
    }
    const url = api.tag.delete + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取标签下粉丝列表
   * @param {*} token 
   * @param {*} tagId 
   * @param {*} openId 第一个拉取的OPENID，不填默认从头开始拉取
   */
  fetchTagUsers (token, tagId, openId) {
    const form = {
      tagid: tagId,
      next_openid: openId || ''
    }

    const url = api.tag.fetchTagUsers + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 批量为用户打标签
   * @param {*} token 
   * @param {*} openIdList 
   * @param {*} tagId 
   */
  batchTag (token, openIdList, tagId) {
    const form = {
      openid_list: openIdList,
      tagid: tagId
    }

    const url = api.tag.batchTag + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 批量为用户取消标签
   * @param {*} token 
   * @param {*} openIdList 
   * @param {*} tagId 
   */
  batchUntag (token, openIdList, tagId) {
    const form = {
      openid_list: openIdList,
      tagid: tagId
    }

    const url = api.tag.batchUntag + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取用户身上的标签列表
   * @param {*} token 
   * @param {*} openId 
   */
  getTagList (token, openId) {
    const form = {
      openid: openId
    }

    const url = api.tag.getTagList + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 设置用户备注名
   * @param {*} token 
   * @param {*} openId 
   * @param {*} remark 
   */
  remarkUser (token, openId, remark) {
    const form = {
      openid: openId,
      remark: remark
    }

    const url = api.user.remark + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取用户基本信息（包括UnionID机制）
   * @param {*} token 
   * @param {*} openId 
   */
  getUserInfo (token, openId, lang) {
    const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`

    return {url: url}
  }

  /**
   * 批量获取用户基本信息
   * @param {*} token 
   * @param {*} userList 
   */
  bathcUserInfo (token, userList) {
    const form = {
      user_list: userList
    }

    const url = api.user.bathcInfo + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 获取用户列表
   * @param {*} token 
   * @param {*} openId 
   */
  fetchUserList (token, openId) {
    const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`

    return {url}
  }

  /**
   * 获取公众号的黑名单列表
   * @param {*} tokon 
   * @param {*} openId 
   */
  fetchBlackList (tokon, openId) {
    const form = {
      begin_openid: openId
    }
    const url = api.user.fetchBlackList + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }

  /**
   * 拉黑用户
   * @param {*} tokon 
   * @param {*} openIdList 
   */
  batchBlackList (tokon, openIdList) {
    const form = {
      openid_list: openIdList
    }
    const url = api.user.batchBlackList + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  
  /**
   * 取消拉黑用户
   * @param {*} tokon 
   * @param {*} openIdList 
   */
  batchUnBlackList (tokon, openIdList) {
    const form = {
      openid_list: openIdList
    }
    const url = api.user.batchUnBlackList + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }


  getTelAddress (tel) {
    const url = 'http://cx.shouji.360.cn/phonearea.php?number=' + tel

    return {url: url}
  }
}