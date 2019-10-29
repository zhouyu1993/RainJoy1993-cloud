//app.js
const ald = require('./utils/ald-stat.js')

App({
  globalData: {
    userInfo: null,
    openid: '',
    shareTicket: null,
  },
  onLaunch (options) {
    console.log('App.onLaunch: ', options)

    const { shareTicket, } = options

    if (shareTicket) {
      this.globalData.shareTicket = shareTicket
    }

    wx.showShareMenu({
      withShareTicket: true,
    })

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
  },
  onShow (options) {
    console.log('App.onShow: ', options)

    const { shareTicket, } = options

    if (shareTicket) {
      this.globalData.shareTicket = shareTicket
    }

    wx.showShareMenu({
      withShareTicket: true,
    })

    this.getUpdateManager()
  },
  onHide () {
    console.log('App.onHide')
  },
  onError (error) {
    console.log('App.onError', error)
  },
  onPageNotFound (options) {
    console.log('App.onPageNotFound', options)

    wx.switchTab({
      url: '/pages/setting/index',
      success: res => {
        console.log('wx.switchTab.success: ', res)
      },
      fail: err => {
        console.error('wx.switchTab.fail: ', err)
      },
    })
  },
  getUpdateManager () {
    try {
      if (wx.getUpdateManager) {
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(res => {
          // 请求完新版本信息的回调
          console.log('onCheckForUpdate:', res)
        })

        updateManager.onUpdateReady(() => {
          // 新版本下载成功
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            },
          })
        })

        updateManager.onUpdateFailed(res => {
          // 新版本下载失败
          console.log('onUpdateFailed:', res)
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
})
