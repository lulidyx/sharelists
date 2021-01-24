# ShareList

ShareList 是一个易用的网盘工具，支持快速挂载 GoogleDrive、OneDrive ，可通过插件扩展功能。

## 目录
* [功能说明](#功能说明) 
* [安装](#安装) 
* [使用示例](#使用示例)   
  * [挂载GoogleDrive](#挂载GoogleDrive) 
  * [挂载OneDrive](#挂载挂载OneDrive) 
  * [挂载本地文件](#挂载本地文件) 
  * [挂载GitHub](#挂载GitHub) 
  * [挂载蓝奏云](#挂载蓝奏云) 
  * [挂载h5ai](#挂载h5ai) 
  * [挂载WebDAV](#挂载WebDAV) 
  * [虚拟目录](#虚拟目录) 
  * [虚拟文件](#虚拟文件) 
  * [目录加密](#目录加密) 
  * [流量中转](#流量中转) 
  * [忽略文件类型](#忽略文件类型) 
  * [文件预览](#文件预览) 
  * [显示README](#显示README) 
  * [负载均衡](#负载均衡) 
  * [Nginx/Caddy反代注意事项](#Nginx/Caddy反代注意事项) 
* [插件开发](#插件开发) 


## 功能说明
- 多种网盘系统快速挂载。 
- 支持虚拟目录和虚拟文件。 
- 支持目录加密。 
- 插件机制。 
- 国际化支持。  
- WebDAV导出。  


## 使用示例
### 挂载GoogleDrive
#### 1. 使用分享ID挂载
由[plugins/drive.gd.js](drive.gd)插件实现。  
```
挂载标示：gd
挂载内容：分享的文件ID
```

#### 2. 使用官方API挂载
由[plugins/drive.gd.api.js](drive.gd.api)插件实现。
```
挂载标示：gda  
挂载内容：  
  文件(夹)id->应用ID|应用机钥|回调地址|refresh_token     
  文件(夹)id   
  /
```
ShareList会根据填写的挂载内容的不同形式，自动开启挂载向导，按指示操作即可。   

### 挂载OneDrive
#### 1. 使用分享ID挂载
由[plugins/drive.od.js](plugins/drive.od.js)插件实现。  
```
挂载标示：od  
挂载内容：分享的文件ID。 
``` 
#### 2. 使用官方API挂载
由[plugins/drive.od.api.js](plugins/drive.od.api.js)插件实现。   
```
挂载标示：oda
挂载内容：   
    OneDrive路径->应用ID|应用机钥|回调地址|refresh_token
    OneDrive路径
    /
```
ShareList会根据填写的挂载内容，自动开启挂载向导，按指示操作即可。  
对于不符合OneDrive安全要求的域名，将采用中转方式验证，[查看中转页面](https://github.com/reruin/reruin.github.io/blob/master/redirect/onedrive.html)。   
**注意：由于onedrive修改了政策，个人Microsoft帐户已无法通过向导进行绑定。
需前往 [Azure管理后台](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) 注册应用并获取  app_id 和 app_secret 。**  
#### 3. 挂载OneDrive For Business
由[plugins/drive.odb.js](plugins/drive.odb.js)插件实现。  
```
挂载标示：odb  
挂载内容：分享的url
```

### 挂载本地文件
由[drive.fs.js](app/plugins/drive.fs.js)插件实现。  
```
挂载标示：fs   
挂载内容：文件路径。
```
**注意：统一使用unix风格路径，例如 windows D盘 为 ```/d/```。**   

### 挂载GitHub
由[plugins/drive.github.js](plugins/drive.github.js)插件实现。用于访问GitHub代码库。有以下两种挂载方式。    
```
挂载标示：github   
挂载内容： 
  username   
  username/repo
```  
**注意：仅用于浏览，不支持 ```git clone``` 等git操作。**  

### 挂载蓝奏云
由[plugins/drive.lanzou.js](drive.lanzou)插件实现。提供对[蓝奏云](https://www.lanzou.com/)的访问支持。   
```
挂载标示：lanzou
挂载路径：  
  folderId  
  password@folderId
``` 
**注意：```folderId```是分享链接中```bxxxxxx```部分。**   

插件为 ```mp4/jpg ```等禁止上传的格式提供解析支持，只需在文件名后附加```txt```后缀即可。以mp4为例，将```xxx.mp4```命名为```xxx.mp4.txt```后再上传，插件将自动解析为mp4文件。 

### 挂载h5ai
由[drive.h5ai.js](plugins/drive.h5ai.js)插件实现，用于访问h5ai目录程序。  
```
挂载标示：h5ai   
挂载路径：http地址
```
例如： ```h5ai:https://larsjung.de/h5ai/demo/```   

### 挂载WebDAV
由[drive.webdav.js](plugins/drive.webdav.js)插件实现，用于访问WebDAV服务。  
```
挂载标示：webdav  
挂载路径：  
  https://webdavserver.com:1222/path   
  https://username:password@webdavserver.com:1222/path   
  https://username:password@webdavserver.com:1222/?acceptRanges=none
```
**注意：若服务端不支持断点续传，需追加```acceptRanges=none```** 

### 虚拟目录
在需创建虚拟目录处新建```目录名.d.ln```文件。 其内容为```挂载标识:挂载路径```。   
指向本地```/root```的建虚拟目录  
```   
fs:/root 
``` 

指向GoogleDrive的某个共享文件夹虚拟目录   
```
gd:0BwfTxffUGy_GNF9KQ25Xd0xxxxxxx 
```  
系统内置了一种单文件虚拟目录系统，使用yaml构建，以```sld```作为后缀保存。参考[example/ShareListDrive.sld](example/sharelist_drive.sld)。 


### 虚拟文件
与虚拟目录类似，目标指向具体文件。  
在需创建虚拟文件处新建```文件名.后缀名.ln```文件。 其内容为```挂载标识:挂载路径```。 
如：创建一个```ubuntu_18.iso```的虚拟文件，请参考[example/linkTo_download_ubuntu_18.iso.ln](example)。 
  

### 目录加密
在需加密目录内新建 ```.passwd``` 文件，```type```为验证方式，```data```为验证内容。  
目前只支持用户名密码对加密（由[auth.basic](app/plugins/auth.basic.js)插件实现）。
例如：    
```yaml
type: basic 
data: 
  - user1:111111 
  - user2:aaaaaa 
``` 

```user1```用户可使用密码```111111```验证，```user2```用户可使用密码```aaaaaa```验证。请参考[example/secret_folder/.passwd](example)。 

### 流量中转
后台管理，常规设置，将```中转（包括预览）```设为启用即可实现中转代理。

### 负载均衡
由[drive.lb.js](app/plugins/drive.lb.js)插件实现。用于将请求转发到多个对等的网盘。       
```
挂载标示：lb
挂载路径：  
  用;分割多个路径地址  
``` 

例如，已经在```http://localhost/a```和```http://localhost/b```路径上挂载了内容相同的两个网盘，需要将两者的请求其合并到```http://localhost/c```路径下，在后台虚拟路径处，选择LoadBalancer类型，挂载路径填写为```/a;/b```即可。 

**注意：负载目录建立后，其目标目录将被自动隐藏（管理员模式可见）。**   

### 忽略文件类型 
后台管理，常规设置，```忽略文件类型```可定义忽略的文件类型。例如忽略图片：```jpg,png,gif,webp,bmp,jpeg```。  
### 显示README
后台管理，常规设置，将```显示README.md内容```设为启用，当前目录包含```README.md```时，将自动显示在页面。

### 文件预览
后台管理，常规设置，将```详情预览```设为启用即可对特定文件进行预览。目前支持：   

#### 文档类
由[preview.document](plugins/drive.document.js)插件实现，可预览md、word、ppt、excel。

#### 多媒体
由[preview.media](plugins/drive.media.js)插件实现，可预览图片、音频、视频提供。  
后台管理，插件设置，```支持预览的视频后缀```可定义可预览视频类型。  

#### Torrent  
由[preview.torrent](plugins/drive.torrent.js)插件实现，为种子文件提供在线预览。

### Nginx/Caddy反代注意事项
使用反代时，请添加以下配置。  
Nginx   
```ini
  proxy_set_header Host  $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
```   
Caddy   
```ini
  header_upstream Host {host}
  header_upstream X-Real-IP {remote}
  header_upstream X-Forwarded-For {remote}
  header_upstream X-Forwarded-Proto {scheme}
```

## 插件开发
待完善   


## 安装
### Shell
```bash
bash install.sh
```
远程安装 / Netinstall
```bash
wget --no-check-certificate -qO-  https://raw.githubusercontent.com/reruin/sharelist/master/netinstall.sh | bash
```
更新 / Update
```bash
bash update.sh
```  

### Docker support
```bash
docker build -t yourname/sharelist .

docker run -d -v /etc/sharelist:/app/cache -p 33001:33001 --name="sharelist" yourname/sharelist
```

OR

```bash
docker-compose up
```

访问 `http://localhost:33001` 
WebDAV 目录 `http://localhost:33001/webdav` 


### Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/reruin/sharelist-heroku)