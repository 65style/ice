import mongoose from 'mongoose'
import config from '../config'
import fs from 'fs'
import { resolve } from 'path'

const models = resolve(__dirname, '../database/schema')

fs.readdirSync(models)  
  .filter(file => ~file.search(/^[^\.].*js$/)) // 读取目录筛选出以.js结尾的文件
  .forEach(file => require(resolve(models, file)))

export const database = app => {
  mongoose.set('debug', true)

  mongoose.connect(config.db)

  mongoose.connection.on('disconnected', () => {
    mongoose.connect(config.db)
  })

  mongoose.connection.on('error', err => {
    console.error(err)
  })

  mongoose.connection.on('open', async => {
    console.log('Connected to MongoDB', config.db)
  })
}