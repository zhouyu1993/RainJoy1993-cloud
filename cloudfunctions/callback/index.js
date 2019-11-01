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
  try {
    const time = Date.now() + 8 * 60 * 60 * 1000

    console.log('debug: ', event, '||', context, '||', time)

    const {
      FromUserName = '',
      ToUserName = '',
      CreateTime = '',
      MsgId = '',
      MsgType = '', // text, image, event, miniprogrampage

      Content = '', // MsgType === text

      PicUrl = '', // MsgType === image
      MediaId = '', // MsgType === image

      Event = '', // MsgType === event
      SessionFrom = '', // MsgType === event

      Title = '', // MsgType === miniprogrampage
      AppId = '', // MsgType === miniprogrampage
      PagePath = '', // MsgType === miniprogrampage
      ThumbUrl = '', // MsgType === miniprogrampage
      ThumbMediaId = '', // MsgType === miniprogrampage
    } = event

    const wxContext = cloud.getWXContext()

    const {
      OPENID,
      // APPID,
      // UNIONID,
      // ENV,
      // SOURCE,
    } = wxContext

    const touser = FromUserName || OPENID

    cloud.openapi.customerServiceMessage.setTyping({
      touser,
      command: 'Typing'
    })

    let param = {}

    if (MsgType === 'text') {
      if (/用户|打赏|买单/.test(Content)) {
        param = {
          touser,
          ...await getImage(Content),
        }
      } else if (/胸|腿|性感|美女|丝袜|动漫|制服|护士|车模|二次元|推女郎|图片/.test(Content)) {
        const key = Content.replace('图片', '')

        param = {
          touser,
          msgtype: 'text',
          text: {
            content: `暂不支持发送图片消息，<a href="https://uploadbeta.com/api/pictures/random/?key=${key.length > 2 ? '美女' : key}">点击查看吧</a>`,
          },
        }
      } else if (/博客/.test(Content)) {
        param = {
          touser,
          msgtype: 'link',
          link: {
            title: 'RainJoy的博客',
            description: '前端研发工程师',
            url: 'https://zhouyu1993.github.io',
            thumb_url: 'https://zhouyu1993.github.io/images/avatar.png',
          },
        }
      } else if (/小程序/.test(Content)) {
        param = {
          touser,
          msgtype: 'text',
          text: {
            content: '暂不支持发送小程序卡片，<a href="https://zhouyu1993.github.io" data-miniprogram-appid="wx8d1d9b1abb35ca02" data-miniprogram-path="pages/index/index">点击查看吧</a>',
          },
        }
      } else {
        let content = ''

        const time = +`${CreateTime}000` + 8 * 60 * 60 * 1000
        const date = new Date(time)
        const h = date.getHours()

        if (h >= 0 && h < 6) {
          content = '凌晨了...'
        } else if (h >= 6 && h < 9) {
          content = '早上好！'
        } else if (h >= 9 && h < 11) {
          content = '上午好！'
        } else if (h >= 11 && h < 13) {
          content = '中午好！'
        } else if (h >= 13 && h < 18) {
          content = '下午好！'
        } else if (h >= 18 && h <= 24) {
          content = '晚上好！'
        }

        param = {
          touser,
          msgtype: 'text',
          text: {
            content: `${content}要是你发张性感美照，客服小哥哥就会跟你聊天`,
          },
        }
      }
    } else if (MsgType === 'miniprogrampage') {
      if (/用户|打赏|买单/.test(Title)) {
        param = {
          touser,
          ...await getImage(Title),
        }
      } else {
        param = {
          touser,
          msgtype: 'text',
          text: {
            content: `暂时无法处理${MsgType}消息`,
          },
        }
      }
    } else {
      param = {
        touser,
        msgtype: 'text',
        text: {
          content: `暂时无法处理${MsgType}消息`,
        },
      }
    }

    console.log('debug: ', param)

    const result = await cloud.openapi.customerServiceMessage.send(param)

    cloud.openapi.customerServiceMessage.setTyping({
      touser,
      command: 'CancelTyping'
    })

    return result
  } catch (e) {
    console.error(e)

    throw e
  }
}

async function getImage (title = '') {
  let fileID
  if (/用户/.test(title)) {
    fileID = 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/groupQRCode.jpeg'
  } else if (/打赏|买单/.test(title)) {
    fileID = 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/reward.jpeg'
  }

  const img = await cloud.downloadFile({
    fileID,
  })

  console.log('debug: ', img)

  const media = await cloud.openapi.customerServiceMessage.uploadTempMedia({
    type: 'image',
    media: {
      contentType: 'image/jpeg',
      value: img.fileContent,
    },
  })

  console.log('debug: ', media)

  return {
    msgtype: 'image',
    image: {
      media_id: media.mediaId,
    },
  }
}
