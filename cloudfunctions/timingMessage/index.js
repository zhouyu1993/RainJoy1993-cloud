// 云函数入口文件
// 部署：在 cloud-functions/timingMessage 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const formatNumber = input => {
  return input < 10 ? `0${input}` : `${input}`
}

const splitTime = date => {
  return {
    'YY': date.getFullYear(),
    'MM': date.getMonth() + 1,
    'DD': date.getDate(),
    'WW': date.getDay(),
    'hh': date.getHours(),
    'mm': date.getMinutes(),
    'ss': date.getSeconds(),
  }
}

const formatTime = (time, format = 'YY-MM-DD hh:mm:ss', original = false) => {
  const date = new Date(+time)

  if (+date !== 0 && !+date) return format

  if (!format || typeof format !== 'string') {
    format = 'YY-MM-DD hh:mm:ss'
  }

  const t = splitTime(date)

  if (original) return t

  let formatTime = ''
  for (let key in t) {
    formatTime = format.replace(key, formatNumber(t[key]))
    format = formatTime
  }

  return formatTime
}

// 云函数入口函数
/**
 * 将经自动鉴权过的小程序用户 openid 返回给小程序端
 *
 * event 参数包含小程序端调用传入的 data
 *
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const {
    OPENID,
    // APPID,
    // UNIONID,
    // ENV,
    // SOURCE,
  } = wxContext

  const time = Date.now() + 8 * 60 * 60 * 1000

  console.log('debug: ', event, '||', context, '||', wxContext, '||', time)

  const { Type, } = event

  if (Type !== 'Timer') {
    return 'init'
  }

  try {
    const result = await cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'sendSubscribeMessage',
        touser: OPENID,
        templateId: 'NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s',
        page: 'pages/index/index',
        data: {
          thing1: {
            value: '亲爱的朋友' || '昵称',
          },
          thing2: {
            value: '快去微信群里参加拼团报名吧' || '活动名称',
          },
          date3: {
            value: formatTime(time, 'YY-MM-DD') || '活动日期',
          },
          thing4: {
            value: '点击卡片可以打卡签到哦' || '活动说明',
          },
        },
      },
    })

    return result
  } catch (e) {
    console.error(e)

    return e
  }
}
