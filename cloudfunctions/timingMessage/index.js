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

const db = cloud.database()

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

    const { Type, } = event

    if (Type !== 'Timer') {
      return 'init'
    }

    const profilesCollection = db.collection('profiles')

    const res = await profilesCollection.where({

    }).get()

    const profiles = (res.data || []).filter(profile => profile.appointment > 0)

    const sendPromises = profiles.map(async profile => {
      try {
        const touser = profile._openid

        const param = {
          touser,
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
        }

        console.log('debug: ', touser)

        await cloud.openapi.subscribeMessage.send(param)

        return profilesCollection.doc(profile._id).update({
          data: {
            appointment: profile.appointment - 1,
          },
        })
      } catch (e) {
        console.error('debug: ', e)

        if (e.errCode === 43101) {
          return profilesCollection.doc(profile._id).update({
            data: {
              appointment: 0,
            },
          })
        } else {
          return e
        }
      }
    })

    return Promise.all(sendPromises)
  } catch (e) {
    console.error('debug: ', e)

    throw e
  }
}
