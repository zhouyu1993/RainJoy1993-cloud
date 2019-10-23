//index.js
import formatTime from '../../utils/formatTime'

const app = getApp()

Page({
  data: {
    logged: false,
    userInfo: null,

    openGId: '',

    list: [],

    signUpState: false,
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()

    wx.setNavigationBarTitle({
      title: '拼团报名',
    })

    const { shareTicket, } = app.globalData

    console.log('shareTicket: ', shareTicket)

    if (!shareTicket) {
      wx.showToast({
        title: '请在微信群内点击小程序参加',
        icon: 'none',
      })

      return
    }

    wx.getShareInfo({
      shareTicket,
      success: res => {
        console.log('wx.getShareInfo.success: ', res)

        const { cloudID = '', } = res

        wx.cloud.callFunction({
          name: 'cx',
          data: {
            openData: wx.cloud.CloudID(cloudID),
          },
          success: res => {
            console.log('[云函数] [cx] 调用成功', res)

            try {
              const { openData = {}, } = res.result.event

              const { openGId = '', } = openData.data

              this.setData({
                openGId,
              })

              this.getGroups(openGId)
            } catch (e) {
              console.error(e)
            }
          },
          fail: err => {
            console.error('[云函数] [cx] 调用失败', err)
          },
        })
      },
    })
  },
  onShareAppMessage (options) {
    return {
      title: '我参加了拼团报名，你也快来吧',
      path: '/pages/groupSignUp/index',
      success: res => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
        })
      },
      fail: res => {
        wx.showToast({
          title: '取消分享',
          icon: 'none',
        })
      },
    }
  },

  getUserInfo () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              const userInfo = res.userInfo

              this.setData({
                userInfo,
              })

              app.globalData.userInfo = userInfo

              this.getOpenid()
            },
          })
        } else {
          console.error('获取用户信息：未授权')
        }
      }
    })
  },
  async onGetUserInfo (e) {
    const userInfo = e.detail.userInfo

    if (!this.data.logged && userInfo) {
      this.setData({
        logged: true,
        userInfo,
      })

      app.globalData.userInfo = userInfo

      this.getOpenid()

      const db = wx.cloud.database()

      const profiles = db.collection('profiles')

      const count = await profiles.count()

      if (!count.total) {
        // 新增用户
        db.collection('profiles').add({
          data: userInfo,
          success: res => {
            console.log('[数据库] [add] 成功: ', res)
          },
          fail: err => {
            console.error('[数据库] [add] 失败：', err)
          },
        })
      }
    }
  },
  getOpenid (callback) {
    const openid = app.globalData.openid

    if (!openid) {
      // 调用云函数 login
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] 调用成功', res)

          const openid = res.result.openid

          app.globalData.openid = openid

          callback && callback(openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        },
      })
    } else {
      callback && callback(openid)
    }
  },

  getGroups (openGId = '') {
    if (!openGId) {
      wx.showToast({
        title: '请在微信群内点击小程序参加',
        icon: 'none',
      })

      return
    }

    const timestamp = Date.now()
    const date = formatTime(timestamp, 'YY-MM-DD')

    const db = wx.cloud.database()

    // 获取微信群
    db.collection('groups')
    .where({
      openGId,
      date,
    })
    .watch({
      onChange: res => {
        console.log('groups.watch.onChange: ', res)

        const { docs = [], } = res

        const obj = {}
        docs.forEach(doc => {
          obj[doc._openid] = doc
        })

        let list = []
        for (let key in obj) {
          list.push(obj[key])
        }

        this.setData({
          list,
        })
      },
      onError: err => {
        console.error('groups.watch.onError: ', err)
      },
    })
  },

  formSubmit (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    const { userInfo, openid = '', } = app.globalData

    if (!userInfo || !openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })

      return
    }

    const { company = '', goods = '', } = e.detail.value

    if (!company || !company) {
      wx.showToast({
        title: '请填写完整',
        icon: 'none',
      })

      return
    }

    const { openGId = '', } = this.data

    if (!openGId) {
      wx.showToast({
        title: '请在微信群内点击小程序参加',
        icon: 'none',
      })

      return
    }

    if (this.data.signUpState) {
      wx.showToast({
        title: '提交中...',
        icon: 'none',
      })

      return
    }

    this.data.signUpState = true

    const timestamp = Date.now()
    const date = formatTime(timestamp, 'YY-MM-DD')

    const db = wx.cloud.database()

    // 新增微信群的报名
    db.collection('groups').add({
      data: {
        openGId,
        userInfo,
        company,
        goods,
        date,
      },
      success: res => {
        console.log('[数据库] [add] 成功: ', res)

        wx.showToast({
          title: '报名成功',
        })

        this.data.signUpState = false
      },
      fail: err => {
        console.error('[数据库] [add] 失败：', err)

        wx.showToast({
          title: '报名失败',
          icon: 'none',
        })

        this.data.signUpState = false
      },
    })
  },
  formReset () {
    console.log('form发生了reset事件')
  },
})
