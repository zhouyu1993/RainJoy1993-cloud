// 云函数入口文件
// 部署：在 cloud-functions/callback 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
/**
 * 将经自动鉴权过的小程序用户 openid 返回给小程序端
 *
 * event 参数包含小程序端调用传入的 data
 *
 */
exports.main = async (event, context) => {
  const time = Date.now() + 8 * 60 * 60 * 1000

  console.log('debug: ', event, '||', context, time)

  try {
    const wxContext = cloud.getWXContext()

    const { Content = '', CreateTime = '', MsgType = '', } = event

    const time = +`${CreateTime}000` + 8 * 60 * 60 * 1000
    const date = new Date(time)
    const h = date.getHours()

    let msgtype = 'text'
    let text = {}
    let link = {}
    let image = {}
    let miniprogrampage = {}

    if (MsgType === 'text') {
      if (/图片$/.test(Content)) {
        text = {
          content: `暂不支持发送图片消息，<a href="https://uploadbeta.com/api/pictures/random/?key=${Content.replace('图片', '')}">点击查看吧</a>`,
        }
      } else if (Content === '博客') {
        msgtype = 'link'
        link = {
          title: '周宇的博客',
          description: '前端研发工程师',
          url: 'https://zhouyu1993.github.io',
          thumb_url: 'https://zhouyu1993.github.io/images/avatar.png',
        }
      } else if (Content === '小程序') {
        text = {
          content: '暂不支持发送小程序卡片，<a href="https://zhouyu1993.github.io" data-miniprogram-appid="wx8d1d9b1abb35ca02" data-miniprogram-path="pages/index/index">点击查看吧</a>',
        }
      } else {
        let content = ''

        if (h >= 0 && h < 6) {
          content = '凌晨了...'
        } else if (h >= 6 && h < 9) {
          content = '早上好'
        } else if (h >= 9 && h < 11) {
          content = '上午好'
        } else if (h >= 11 && h < 13) {
          content = '中午好'
        } else if (h >= 13 && h < 18) {
          content = '下午好'
        } else if (h >= 18 && h <= 24) {
          content = '晚上好'
        }

        text = {
          content,
        }
      }
    } else {
      text = {
        content: `暂时无法处理${MsgType}消息`,
      }
    }

    const result = await cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'sendCustomerServiceMessage',
        touser: wxContext.OPENID,
        msgtype,
        text,
        image,
        link,
        miniprogrampage,
      },
    })

    return result
  } catch (e) {
    console.error(e)

    return e
  }
}
