/*
 * xdrive 是 sharelist 内置的使用yaml描述的网盘系统 , 没有缓存
 */

const name = 'ShareListDrive'

const version = '1.0'

const protocols = ['sld','xd']

const defaultProtocol = 'xd'

const yaml = require('yaml')

const { URL } = require('url')

const crypto = require('crypto')

const md5 = (v) => {
  return crypto.createHash('md5').update(v).digest('hex')
}

module.exports = ({isObject , isArray}) => {

  const diskMap = {}

  const parse = (id) => {
    let data = new URL(id)

    let rootId = data.hostname
    let path = data.pathname.replace(/^\/+/,'').split('/')
    return {
      disk:diskMap[rootId] , 
      path
    }
  }

  /* 递归生成 索引 id */
  const createId = (d, rootId) => {
    d.forEach((i, index) => {
      if (isObject(i)) {
        let name = i.name.replace(/\.d\.ln$/, '').replace(/\.ln$/, '')
        i.id = rootId + '/' + name
        i.protocol = defaultProtocol
        if (i.children) {
          i.type = 'folder'
          i.protocol = defaultProtocol
          createId(i.children, i.id)
        } else {
          i.ext = i.name.split('.').pop()
        }

      } else if (isArray(i)) {
        createId(i, rootId)
      }
    })
    return d
  }

  const mount = async (key,data) => {

    if (data) {

      let key = md5(data)

      let id = defaultProtocol+'://'+key

      let resp = { id, type: 'folder', protocol: defaultProtocol }

      let json = yaml.parse(data)

      json = createId(json, id)
      resp.children = json
      resp.updated_at = Date.now()

      diskMap[key] = resp
      return resp
    } else {
      return undefined
    }
  }

  const findById = (id) => {
    let { disk , path } = parse(id)
    if(disk){
      for (let i = 0; i < path.length && disk; i++) {
        disk = disk.children
        disk = disk.find(j => {
          return j.name == decodeURIComponent(path[i])

          if (j.type == 'folder') {
            return `${j.name}.${j.ext}` == path[i]
          } else {
            return `${j.name}` == path[i]
          }
        }) //[ parseInt(path[i]) ]
      }

      return disk
    }else{
      return []
    }
  }

  const folder = async (id,{ content } = {}) => {
    if(content){
      return mount(id,content)
    }else{
      return findById(id)
    }
  }

  const file = async (id) => {
    let data = findById(id)
    return data
  }

  return { name, version, drive: { protocols, folder, file } }
}
