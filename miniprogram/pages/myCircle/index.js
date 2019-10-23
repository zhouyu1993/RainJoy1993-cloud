//index.js
import formatTime from '../../utils/formatTime'

const app = getApp()

Page({
  data: {
    logged: false,
    avatarUrl: '../../images/user-unlogin.png',
    nickName: '点击登录',
    userInfo: null,

    articles: [],

    cameraUrl: '../../images/camera.png',
    plusUrl: '../../images/plus.png',
    locationUrl: '../../images/location.png',
    visible: false,
    textarea: '',
    images: [],
    location: {},
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()
  },
  onPullDownRefresh () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()
  },
  onReachBottom () {
    this.getArticles()
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

              this.getOpenid(() => {
                this.getArticles(true)
              })
            },
          })
        } else {
          console.error('获取用户信息：未授权')
        }
      }
    })
  },
  onGetUserInfo (e) {
    const userInfo = e.detail.userInfo

    if (!this.data.logged && userInfo) {
      this.setData({
        logged: true,
        userInfo,
      })

      app.globalData.userInfo = userInfo

      this.getOpenid(() => {
        this.getArticles(true)
      })

      const db = wx.cloud.database()

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

  getArticles (refresh = false) {
    const openid = app.globalData.openid

    if (!openid) {
      return
    }

    const { articles = [], } = this.data

    const db = wx.cloud.database()

    // 获取文章
    db.collection('articles')
    .orderBy('timestamp', 'desc')
    .where({
      _openid: openid,
    })
    .skip(refresh ? 0 : articles.length)
    .limit(10)
    .get()
    .then(res => {
      const now = Date.now()

      const data = res.data.map(item => {
        let time

        const timestamp = item.timestamp
        const diff = now - timestamp

        if (diff < 60 * 1000) {
          time = '刚刚'
        } else if (diff < 60 * 60 * 1000) {
          time = `${Math.floor(diff / 1000 / 60)}分钟前`
        } else if (diff < 24 * 60 * 60 * 1000) {
          time = `${Math.floor(diff / 1000 / 60 / 60)}小时前`
        } else if (diff < 2 * 24 * 60 * 60 * 1000) {
          time = '昨天'
        } else {
          time = formatTime(timestamp)
        }

        return {
          ...item,
          time,
        }
      })

      this.setData({
        articles: refresh ? data : articles.concat(data),
      })
    })
  },
  openLocation (e) {
    // 查看位置
    const { latitude, longitude, } = e.currentTarget.dataset

    wx.openLocation({
      latitude,
      longitude,
      scale: 18,
    })
  },
  delete (e) {
    wx.showModal({
      title: '',
      content: '确定删除吗？',
      cancelText: '取消',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          const { id, filelist, } = e.currentTarget.dataset

          // 删除文章
          // 调用云函数 remove
          wx.cloud.callFunction({
            name: 'remove',
            data: {
              name: 'articles',
              rule: {
                _id: id,
              },
            },
            success: res => {
              console.log('[云函数] [remove] 调用成功', res)

              const { removed } = res.result && res.result.stats

              if (removed) {
                wx.showToast({
                  title: '删除成功',
                })

                // 删除文件
                // 调用云函数 deleteFile
                wx.cloud.callFunction({
                  name: 'deleteFile',
                  data: {
                    fileList: filelist,
                  },
                  success: res => {
                    console.log('[云函数] [deleteFile] 调用成功', res)
                  },
                  fail: err => {
                    console.error('[云函数] [deleteFile] 调用失败', err)
                  },
                })

                const { articles = [], } = this.data

                this.setData({
                  articles: articles.filter(article => article._id !== id),
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none',
                })
              }
            },
            fail: err => {
              console.error('[云函数] [remove] 调用失败', err)

              wx.showToast({
                title: '删除失败',
                icon: 'none',
              })
            },
          })
        }
      },
    })
  },

  showForm () {
    const openid = app.globalData.openid

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })

      return
    }

    this.setData({
      visible: true,
    })
  },
  chooseImage () {
    const openid = app.globalData.openid

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })

      return
    }

    const { visible = false, textarea = '', images = [], } = this.data

    if (!visible && (textarea || images.length)) {
      this.showForm()

      return
    }

    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        this.uploadFile(filePath)
      },
    })
  },
  uploadFile (filePath) {
    // 上传图片
    const cloudPath = `image-${Date.now()}${filePath.match(/\.[^.]+?$/)[0]}`

    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)

        const { images = [], } = this.data

        images.push(res.fileID)

        this.setData({
          visible: true,
          images,
        })
      },
      fail: err => {
        console.error('[上传文件] 失败：', err)

        wx.showToast({
          title: '上传失败',
          icon: 'none',
        })
      },
      complete: () => {
        wx.hideLoading()
      },
    })
  },
  textareaInput (e) {
    const { value, } = e.detail

    this.setData({
      textarea: value,
    })
  },
  chooseLocation () {
    // 选择位置
    wx.chooseLocation({
      success: res => {
        console.log('[选择位置] 成功：', res)

        this.setData({
          location: res,
        })
      },
      fail: err => {
        console.error('[选择位置] 失败：', err)
      },
    })
  },
  formSubmit () {
    const { userInfo = {}, textarea = '', images = [], location = {}, } = this.data

    if (!textarea && !images.length) {
      wx.showToast({
        title: '请输入',
        icon: 'none',
      })

      return
    }

    const timestamp = Date.now()

    const db = wx.cloud.database()

    // 新增文章
    db.collection('articles').add({
      data: {
        userInfo,
        textarea,
        images,
        location,
        timestamp,
      },
      success: res => {
        console.log('[数据库] [add] 成功: ', res)

        wx.showToast({
          title: '发表成功',
        })

        this.setData({
          visible: false,
          textarea: '',
          images: [],
          location: {},
        })

        this.getArticles(true)
      },
      fail: err => {
        console.error('[数据库] [add] 失败：', err)

        wx.showToast({
          title: '发表失败',
          icon: 'none',
        })
      },
    })
  },
  formCancel () {
    const { textarea = '', images = [], } = this.data

    if (!textarea && !images.length) {
      this.setData({
        visible: false,
      })

      return
    }

    wx.showModal({
      title: '',
      content: '将此次编辑保留？',
      cancelText: '不保留',
      confirmText: '保留',
      success: res => {
        if (res.confirm) {
          this.setData({
            visible: false,
          })
        } else if (res.cancel) {
          this.setData({
            visible: false,
            textarea: '',
            images: [],
            location: {},
          })
        }
      },
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
