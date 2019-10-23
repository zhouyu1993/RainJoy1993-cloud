// 云函数入口文件
// 部署：在 cloud-functions/add 文件夹右击选择 “上传并部署”
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

  const { numbers = [], } = event

  return numbers.reduce((a,b) => a + b)
}
