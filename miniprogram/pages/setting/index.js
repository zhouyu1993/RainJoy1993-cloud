//index.js
const app = getApp()

Page({
  data: {
    logged: false,
    userInfo: null,
    avatarUrl: 'https://zhouyu1993.github.io/images/user-unlogin.png',
    nickName: '点击登录',

    modules: [],

    systemInfo: {},
    speacialValue: '',
  },
  onLoad () {
    const systemInfo = wx.getSystemInfoSync()

    this.setData({
      systemInfo,
    })
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()

    wx.setNavigationBarTitle({
      title: '设置',
    })

    this.getModules()
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
        data: {

        },
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

  getModules () {
    const db = wx.cloud.database()

    // 获取模块
    db.collection('modules')
    .where({

    })
    .get()
    .then(res => {
      console.log(res)

      this.setData({
        modules: res.data,
      })
    })
  },

  goTo (e) {
    const { login = false, link = '', } = e.currentTarget.dataset

    if (login) {
      const openid = app.globalData.openid

      if (!openid) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
        })

        return
      }
    }

    wx.navigateTo({
      url: link,
      success: res => {
        console.log('wx.navigateTo.success: ', res)
      },
      fail: err => {
        console.error('wx.navigateTo.fail: ', err)

        if (/a tabbar page/.test(err.errMsg)) {
          wx.switchTab({
            url: value,
            success: res => {
              console.log('wx.switchTab.success: ', res)
            },
            fail: err => {
              console.error('wx.switchTab.fail: ', err)
            },
          })
        } else if (/is not found/.test(err.errMsg)) {
          wx.showToast({
            title: '待开发功能',
            icon: 'none',
          })
        }
      },
    })
  },

  speacialInput (event) {
    const { value } = event.detail

    this.setData({
      speacialValue: value,
    })
  },
  speacialSearch () {
    const value = this.data.speacialValue

    if (!value) return

    wx.navigateTo({
      url: value,
      success: res => {
        console.log('wx.navigateTo.success: ', res)
      },
      fail: err => {
        console.error('wx.navigateTo.fail: ', err)

        if (/a tabbar page/.test(err.errMsg)) {
          wx.switchTab({
            url: value,
            success: res => {
              console.log('wx.switchTab.success: ', res)
            },
            fail: err => {
              console.error('wx.switchTab.fail: ', err)
            },
          })
        } else if (/is not found/.test(err.errMsg)) {
          wx.showToast({
            title: '待开发功能',
            icon: 'none',
          })
        }
      },
    })
  },
})
