const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new mongoose.Schema({
  name: String,
  token: String,
  expires_in: Number,
  meta: {
    createdAt: {
      type: Date,
      default: new Date
    },
    updatedAt: {
      type: Date,
      default: new Date
    }
  }
})

TokenSchema.pre('save', function(next) {  // 在每一条数据保存之前
  if (this.isNew) { // 如果是新增的, 就把创建时间和更新时间重置为当前时间
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {  // 不是新增的则只重制更新时间
    this.meta.updateAt = Date.now()
  }
  next()
})

TokenSchema.statics = {  // 添加静态方法 
  async getAccessToken () {
    const token = await this.findOne({
      name: 'access_token'
    }).exec()

    if (token && token.token) {
      token.access_token = token.token
    }
    
    return token
  },

  async saveAccessToken (data) {

    let token = await this.findOne({
      name: 'access_token'
    }).exec()

    if (token) {
      token.token = data.access_token
      token.expires_in = data.expires_in
    } else {
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }

    await token.save()

    return data
  }
}

const Token = mongoose.model('Token', TokenSchema)