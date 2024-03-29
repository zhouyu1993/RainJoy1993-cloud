# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## QA

* 云函数更新 - 困难❓
  - 整个目录，同步云函数列表 ❌
  - 单个云函数，上传并部署 ✅

* 定时触发器
  - 调用时，会先执行一次？
  - 执行失败

* 云函数 - 右键更多设置，存在已删除的云函数

https://developers.weixin.qq.com/community/develop/doc/000882c01a43b8154f675b2e356c00?highline=%E6%9B%B4%E5%A4%9A%E8%AE%BE%E7%BD%AE

https://developers.weixin.qq.com/community/develop/doc/0004c60e2d47a8a3f257e454751800?highline=%E4%BA%91%E5%87%BD%E6%95%B0%20-%20%E5%8F%B3%E9%94%AE%E6%9B%B4%E5%A4%9A%E8%AE%BE%E7%BD%AE%EF%BC%8C%E5%AD%98%E5%9C%A8%E5%B7%B2%E5%88%A0%E9%99%A4%E7%9A%84%E4%BA%91%E5%87%BD%E6%95%B0

* 云调用
  * 用户信息 - 支付
  * 数据分析 👍
    - 访问留存
    - 访问趋势
  * 客服消息 👍
  * 模板消息 - 即将下线
  * 统一服务消息 - 即将调整
  * 动态消息 👍
  * 插件管理
  * 附近的小程序
  * 小程序码 👍
  * 内容安全 👍
  * 图像处理 👍
  * 物流助手
  * OCR
  * 生物认证
  * 订阅消息 👍

## 个人主体小程序开放的服务类目

* 快递业与邮政
  - 快递、物流
    * 查件 - 提供快递、物流行业的查件业务 注：不包含寄件、收件业务
  - 装卸搬运 - 适用于物流设施内的装卸搬运业务，如工程、港口等地方货物装卸
* 教育
  - 教育信息服务 - 适用于教育政策、考试通知等教育信息服务 注：不包含教育培训机构推广等个人主体暂未开类目范畴
  - 婴幼儿教育 - 适用于0～6岁年龄阶段的婴幼儿教育
  - 在线教育 - 适用于在线教育、网络教育或者远程教育等以互联网为载体的教育服务
  - 教育装备 - 适用于教育教学活动所需的教具、学具、器材、设施、场所及其配置服务
  - 特殊人群教育 - 适用于特殊人群方面相关的教育
* 出行与交通
  - 代驾 - 提供代驾服务 注：不包含提供顺风车、网约车等服务
* 生活服务
  - 丽人
    * 美甲
    * 美容
    * 美睫
    * 美发
    * 纹身
    * 祛痘
    * 纤体瘦身
    * 舞蹈
    * 瑜伽
    * 其他
      - 提供美甲、美容、美睫、美发、纹身、祛痘、纤体瘦身、舞蹈、瑜伽等不含医疗美容服务 注：不包含医疗美容服务（如：隆鼻、激光等）、推拿、洗浴等个人小程序中未开放类目经营范围
  - 环保回收/废品回收 - 提供废旧物品回收、二手电器回收等
  - 摄影/扩印 - 提供证件照、艺术照摄影、相片扩印等服务
  - 婚庆服务 - 提供婚礼庆典 策划、婚纱摄影、婚宴酒席、婚礼摄像、蜜月旅行等相关服务 注：不包含社交婚恋服务
  - 家政 - 提供包括家政类项目资讯、家政在线预约：比如；保姆、月嫂、房屋保洁、家电维修、数码电器维修等
* 餐饮
  - 点评与推荐 - 提供美食餐厅的推荐、展示
  - 菜谱 - 提供美食菜谱查询功能
  - 餐厅排队 - 提供个体餐饮门店提供就餐线上取号、排号等排队服务 注：不包含线上点餐、外卖等服务
* 旅游
  - 出境WiFi - 提供提供出境WIFI租赁/销售 注：不包含境外流量、话费充值服务
  - 旅游攻略 - 提供旅行/出游攻略查阅等
* 工具
  - 记账 - 提供如：消费记录等模板功能的记账工具 注：不包含提供用户自定义生成内容记录及分享
  - 日历 - 提供日历相关服务
  - 天气 - 提供天气查询等相关服务
  - 办公 - 提供办公工具、服务
    **👍**
    * 签到打卡
      - 当日日期、天气、美图
      - 签到，分享
      - 每次签到后，获取一次提醒下一次签到
      - 连续一个月按时出勤，月末参加抽奖
  - 字典 - 提供字典查询工具
    **👍**
    * 翻译
  - 图片 - 提供图片/音频/视频制作、剪辑
    **👍**
    * 头像制作？
    * 名片制作？
  - 计算类 - 提供计算工具等
    **👍**
    * 计算器、工资计算、房贷计算
  - 报价/比价 - 提供商品报价、价格对比服务
  - 信息查询 - 提供信息查询功能
    **👍**
  - 效率 - 提供日常生活、工作效率提升类服务
    **👍**
  - 预约/报名 - 提供预约/报名功能
    **👍**
    * 发布活动
      - 下午茶 [预约/报名 -> 获取一次推送权限 -> 管理员点击送达 -> 发送通知]
        * 超级管理员：我，添加管理员、发送通知、预约/报名、评论
        * 管理员：我爸，发送通知、预约/报名、评论
        * 会员：预约/报名、评论
      - 分享会
        * 会员：创建主题、预约/报名、评论
  - 健康管理 - 提供身高、体重等健康管理记录
    **👍**
    * 记录个人身高、体重，计算 BMI 指数
  - 企业管理 - 提供企业办公工具/办公管理
* 商业服务
  - 律师（《律师执业资格证》）- 适用于已通过国家司法考试并依法取得律师执业证书的执业人员接受委托或者指定，为当事人提供在线法律服务
  - 会展服务 - 提供商业会展服务，会展中心推广/介绍等
* 体育
  - 体育培训 - 提供各种体育项目培训/学习的服务
  - 在线健身 - 提供各类型的健身运动在线学习/在线指导服务

* 工具
  - 计算 ✅
  - 图片 ✅
  - 效率 ✅
  - 预约/报名 ✅
  - 信息查询 ✅

##

* project.config.json
* cloudfunctions
* miniprogram
  - pages
    * microCircle 微圈
    * setting 设置
      - 用户登录

      - 我的微圈
      - 音乐小站
      - 吉他曲谱

      - 关于作者
      - 打赏支持
      - 更新日志

      - 联系客服
      - 意见反馈
      - 授权设置

      - 智能美颜❓
      - 头脑王者❓

# todos

* 图片点击放大、再点击收回，长按保存✅
* 表单重新编辑

# bugs

* 云函数调用云函数（封装客服），会报错
* 客服小助手接入后导致云函数（封装客服）停止，怎么再重启呢？
