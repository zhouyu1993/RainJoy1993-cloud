import alert from './alert'

let flag = false

const navigateTo = option => {
  if (flag) return
  flag = true

  if (typeof option === 'string') {
    option = {
      url: option,
    }
  } else if (typeof option !== 'object') {
    flag = false
    alert('参数错误')

    return
  }

  const {
    url,
    success = res => {},
    fail = res => {
      console.log(res)

      alert('系统异常')
    },
    reLaunchUrl = '/pages/index/index',
  } = option

  if (typeof success !== 'function' || typeof fail !== 'function') {
    flag = false
    alert('参数错误')

    return
  }

  wx.navigateTo({
    url,
    success: res => {
      success(res)

      setTimeout(() => {
        flag = false
      }, 300)
    },
    fail: err => {
      console.error(err)

      if (reLaunchUrl) {
        wx.reLaunch({
          url: reLaunchUrl,
        })
      } else {
        fail(err)
      }

      setTimeout(() => {
        flag = false
      }, 300)
    },
  })
}

export default navigateTo
