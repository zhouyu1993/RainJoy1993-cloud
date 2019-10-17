//index.js
const app = getApp()

Page({
  data: {
    articles: [],
    logged: false,
    avatarUrl: './user-unlogin.png',
    nickName: '用户',
    userInfo: {},
    form: {
      images: [],
    },
  },

  onLoad () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })

      return
    }

    this.getUserInfo()

    this.getArticles()
  },

  onShareAppMessage (options) {
    return {
      title: '微书',
      path: '/pages/microBook/index',
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

  onGetUserInfo (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        userInfo: e.detail.userInfo,
      })
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
              this.setData({
                userInfo: res.userInfo,
              })
            },
          })
        }
      }
    })
  },

  getArticles () {
    // 获取文章
    const db = wx.cloud.database()

    db.collection('articles').get().then(res => {
      console.log(res)

      const now = Date.now()

      const articles = res.data.map(item => {
        let time

        const timestamp = item.timestamp
        const diff = now - timestamp

        console.log(timestamp, now, diff)

        if (diff < 60 * 1000) {
          time = '刚刚'
        } else if (diff < 60 * 60 * 1000) {
          time = `${Math.floor(diff / 1000 / 60)}分钟前`
        } else if (diff < 24 * 60 * 60 * 1000) {
          time = `${Math.floor(diff / 1000 / 60 / 60)}小时前`
        } else if (diff < 2 * 24 * 60 * 60 * 1000) {
          time = '昨天'
        } else {
          time = new Date(timestamp)
        }

        return {
          ...item,
          time,
        }
      })

      this.setData({
        articles,
      })
    })
  },

  uploadImage () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.log(res)

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        console.log(filePath)

        // 上传图片
        const cloudPath = `image-${Date.now()}${filePath.match(/\.[^.]+?$/)[0]}`
        console.log(cloudPath)

        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            const form = this.data.form

            form.images.push(res.fileID)

            this.setData({
              form,
            })
          },
          fail: err => {
            console.error('[上传文件] 失败：', err)

            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          },
        })
      },
    })
  },
  formSubmit (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    const textarea = e.detail.value.textarea

    const { userInfo, form, } = this.data

    if (!textarea && !form.images.length) {
      return
    }

    const db = wx.cloud.database()

    db.collection('articles').add({
      data: {
        ...userInfo,
        ...form,
        textarea,
        timestamp: Date.now(),
      },
      success: res => {
        console.log('[数据库] [add] 成功: ', res)

        wx.showToast({
          title: '发表成功',
        })

        this.getArticles()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败',
        })
        console.error('[数据库] [add] 失败：', err)
      },
    })
  },
  formReset () {
    console.log('form发生了reset事件')
  },
})
