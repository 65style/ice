import xml2js from 'xml2js'
import template from './tpl'

function parseXMl (xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

// { 
//   ToUserName: [ 'gh_97b1b9590cdb' ],
//   FromUserName: [ 'oTJAh0-dgmvXWzMG998T7JXRI27w' ],
//   CreateTime: [ '1541941654' ],
//   MsgType: [ 'text' ],
//   Content: [ '我搞糊涂哦' ],
//   MsgId: [ '6622588976716914939' ] 
// } 
function formatMessage (result) {
  let message = {}

  if (typeof result === 'object') {
    const keys = Object.keys(result)

    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]]
      let key = keys[i]

      if (!(item instanceof Array) || item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]

        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }

  return message
}

function tpl (content, message) {
  let type = 'text'
  if (Array.isArray(content)) {
    type = 'news'
  }
  if (!content) {
    content = '无法回复'
  }

  if (content && content.type) {
    type = content.type
  }

  let info = Object.assign({}, {
    content: content,
    createTime: new Date().getTime(),
    msgType: type,
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  })

  return template(info)
}

export {
  parseXMl,
  formatMessage,
  tpl
}