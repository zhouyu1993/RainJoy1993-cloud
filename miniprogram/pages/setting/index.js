//index.js
const app = getApp()

Page({
  data: {
    logged: false,
    userInfo: null,
    avatarUrl: '../../images/user-unlogin.png',
    nickName: '点击登录',

    collectionUrl: '../../images/collection.png',
    thumbsUpUrl: '../../images/thumbsUp.png',
    microCircleUrl: '../../images/microCircle.png',
    authorUrl: '../../images/author.png',
    rewardUrl: '../../images/reward.png',
    updateLogUrl: '../../images/updateLog.png',
    customerServiceUrl: '../../images/customerService.png',
    feedbackUrl: '../../images/feedback.png',
    authorizationUrl: '../../images/authorization.png',
    groupSignUpUrl: '../../images/groupSignUp.png',
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

  toMyCircle () {
    const openid = app.globalData.openid

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })

      return
    }

    wx.navigateTo({
      url: '/pages/myCircle/index',
    })
  },

  toGroupSignUp () {
    const openid = app.globalData.openid

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })

      return
    }

    wx.navigateTo({
      url: '/pages/groupSignUp/index',
    })
  },

  temporary () {
    wx.showToast({
      title: '待开发',
      icon: 'none',
    })
  },

  subscribe () {
    wx.requestSubscribeMessage({
      tmplIds: [
        '44qDkTAVyd51oOrS14W1KNTFmGcoObSXuszbgaK8a6s',
        '8pRtPqdEiWvwK2d1ETXro3VRRjL44x-1VpZpoaMv65o',
      ],
      success: res => {
        console.log('[requestSubscribeMessage] 调用成功', res)
      },
      fail: err => {
        console.error('[requestSubscribeMessage] 调用失败', err)
      },
    })
  },
})
