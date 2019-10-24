// 云函数入口文件
// 部署：在 cloud-functions/openapi 文件夹右击选择 “上传并部署”
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

  switch (event.action) {
    case 'sendSubscribeMessage': {
      return sendSubscribeMessage(event)
    }
    case 'sendCustomerServiceMessage': {
      return sendCustomerServiceMessage(event)
    }
    default: {
      return
    }
  }
}

async function sendSubscribeMessage (event) {
  try {
    const {
      touser = 'oSfYh0aXrNuSzCq7RbWq-oh_zNTg',
      templateId = 'NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s',
      page = 'pages/index/index',
      data = {},
    } = event

    const result = await cloud.openapi.subscribeMessage.send({
      touser,
      templateId,
      page,
      data,
    })

    return result
  } catch (e) {
    console.error(e)

    return e
  }
}

async function sendCustomerServiceMessage (event) {
  try {
    const {
      touser = 'oSfYh0aXrNuSzCq7RbWq-oh_zNTg',
      msgtype = 'text',
      text = {},
      image = {},
      link = {},
      miniprogrampage = {},
    } = event

    let param = {
      touser,
      msgtype,
      text,
      image,
      link,
      miniprogrampage,
    }
    if (msgtype === 'text') {
      param = {
        touser,
        msgtype,
        text,
      }
    } else if (msgtype === 'image') {
      param = {
        touser,
        msgtype,
        image,
      }
    } else if (msgtype === 'link') {
      param = {
        touser,
        msgtype,
        link,
      }
    } else if (msgtype === 'miniprogrampage') {
      param = {
        touser,
        msgtype,
        miniprogrampage,
      }
    }

    console.log('debug: ', param)

    const result = await cloud.openapi.customerServiceMessage.send(param)

    return result
  } catch (e) {
    console.error(e)

    return e
  }
}
