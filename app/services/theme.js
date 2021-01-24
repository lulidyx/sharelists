const less = require('less-middleware');
const path = require('path')
const os = require('os')
const fs = require('fs')
const staticCache = require('koa-static-cache')
const pug = require('pug')
const mime = require('mime')
const crypto = require('crypto')

const { getSkin , getConfig } = require('../config')

const options = {
  theme:'default',
  cacheStore:{},
  staticMap:{}
}


const render = (ctx, filename , locals = {}) => {
  const state = Object.assign(locals, ctx.state || {})
  pug.renderFile(filename , state, (err, html) => {
    ctx.type = 'text/html'
    ctx.body = html
  })
}

const renderMiddleware = ({ dir }) => (ctx, next) => {
  if(ctx.renderSkin) return next()
  ctx.response.renderSkin = ctx.renderSkin = (relPath , options) => {
    let data = { ...options , __path__:dir,g_config:{
      custom_style:getConfig('custom_style'),
      custom_script:getConfig('custom_script'),
    }}

    return render(ctx, path.resolve(dir, getSkin(), 'view',relPath+'.pug') , data)
  }
  return next()
}


const lessMiddleware = (url , options) => (ctx, next) => new Promise(function (resolve, reject) {
  less(url , options)(ctx.req, ctx.res , (error) =>{
    if(error){
      reject(error);
    }else{
      resolve();
    }
  })
}).then(()=>{
  return next();
})

module.exports = (app , { dir , defaultTheme = 'default' } = {}) => {
  options.theme = defaultTheme
  let dest = os.tmpdir() + '/sharelist'
  app.use(lessMiddleware(dir , { 
    dest,
    preprocess:{
      path:(src, req) => {
        let relpath = path.relative(dir,src)
        let p =  path.resolve(dir,options.theme,relpath)
        options.staticMap[ path.sep + relpath.replace('.less','.css') ] = path.resolve(dest,relpath.replace('.less','.css'))
        return p
      }
    }
  }))

  app.use(renderMiddleware({ dir }))

  let maxage = 30 * 24 * 60 * 60
  app.use(staticCache(dir, {maxage, preload:false }, {
    get(key){
      //let pathname = path.normalize(path.join(options.prefix, name))
      if (!options.cacheStore[key]) options.cacheStore[key] = {}

      let obj = options.cacheStore[key]

      let filename = obj.path = options.staticMap[key] || path.join(dir, options.theme,key)
      let stats , buffer
      try {
        stats = fs.statSync(filename)
        buffer = fs.readFileSync(filename)

      } catch (err) {
        return null
      }

      obj.cacheControl = undefined
      obj.maxAge = obj.maxAge ? obj.maxAge : maxage || 0
      obj.type = obj.mime = mime.getType(path.extname(filename)) || 'application/octet-stream'
      obj.mtime = stats.mtime
      obj.length = stats.size
      obj.md5 = crypto.createHash('md5').update(buffer).digest('base64')

      return obj
    },
    set(key, value){
      cacheStore[key] = value
    }
  }))

}
