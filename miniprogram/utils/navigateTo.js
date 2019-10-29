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
      console.log('wx.navigateTo.success: ', res)

      success(res)

      let st = setTimeout(() => {
        flag = false

        clearTimeout(st)

        st = null
      }, 300)
    },
    fail: err => {
      console.error('wx.navigateTo.fail: ', err)

      if (/a tabbar page/.test(err.errMsg)) {
        wx.switchTab({
          url: url.slice(0, url.indexOf('?')),
          success: res => {
            console.log('wx.switchTab.success: ', res)

            success(res)
          },
          fail: err => {
            console.error('wx.switchTab.fail: ', err)

            fail(err)
          },
        })
      } else if (reLaunchUrl) {
        wx.reLaunch({
          url: reLaunchUrl,
        })
      } else {
        fail(err)
      }

      let st = setTimeout(() => {
        flag = false

        clearTimeout(st)

        st = null
      }, 300)
    },
  })
}

export default navigateTo
