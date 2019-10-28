//index.js

import formatTime from '../../utils/formatTime'

const app = getApp()

Page({
  data: {
    logged: false,
    userInfo: null,
    avatarUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/user-unlogin.png',
    nickName: '点击登录',

    articles: [],

    cameraUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/camera.png',
    plusUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/plus.png',
    locationUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/location.png',
    visible: false,
    textarea: '',
    images: [],
    location: {},

    groupSignUpId: '',
  },
  onLoad (options) {
    const { groupSignUpId, } = options

    this.data.groupSignUpId = groupSignUpId
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
  onShareAppMessage (options) {
    return {
      title: '我的微圈',
      path: '/pages/myCircle/index',
      success: res => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
        })
      },
      fail: err => {
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
  async onGetUserInfo (e) {
    const userInfo = e.detail.userInfo

    if (!this.data.logged && userInfo) {
      this.data.logged = true

      this.setData({
        userInfo,
      })

      app.globalData.userInfo = userInfo

      this.getOpenid(() => {
        this.getArticles(true)
      })

      const db = wx.cloud.database()

      const profiles = db.collection('profiles')

      const count = await profiles.count()

      if (!count.total) {
        // 新增用户
        profiles.add({
          data: userInfo,
          success: res => {
            console.log('[数据库] [add] 成功: ', res)
          },
          fail: err => {
            console.error('[数据库] [add] 失败：', err)
          },
        })
      } else {
        const res = await profiles.where({

        }).get()

        profiles.doc(res.data[0]._id).update({
          data: userInfo,
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

          wx.aldstat.sendOpenid(openid)
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

      const new_articles = refresh ? data : articles.concat(data)

      this.setData({
        articles: new_articles,
      })

      const groupSignUpId = this.data.groupSignUpId

      if (groupSignUpId) {
        const db = wx.cloud.database()

        // 获取报名信息
        const groupSignUp = db.collection('groups').doc(groupSignUpId)

        groupSignUp.get({
          success: res => {
            console.log('groupSignUp.get.success: ', res)

            if (!res.data.state) {
              wx.showModal({
                title: '',
                content: '确定收货吗？',
                cancelText: '取消',
                confirmText: '收货',
                success: res => {
                  if (res.confirm) {
                    // 更改报名

                    groupSignUp.update({
                      data: {
                        state: 1,
                      },
                      success: res => {
                        console.log('groupSignUp.update.success: ', res)

                        if (res.stats.updated) {
                          wx.showToast({
                            title: '收货成功',
                          })

                          const st = setTimeout(() => {
                            wx.redirectTo({
                              url: '/pages/myCircle/index'
                            })

                            clearTimeout(st)
                          }, 300)
                        } else {
                          wx.showToast({
                            title: '收货失败',
                            icon: 'none',
                          })
                        }
                      },
                      fail: err => {
                        console.error('groupSignUp.update.fail: ', err)

                        wx.showToast({
                          title: '收货失败',
                          icon: 'none',
                        })
                      },
                    })
                  }
                },
              })
            } else {
              this.showTip()
            }
          },
          fail: err => {
            console.error('groupSignUp.get.fail: ', err)
          },
        })
      } else if (!new_articles.length) {
        this.showTip()
      }
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

              const { removed, } = res.result && res.result.stats

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
  previewImage (e) {
    const { images = '', } = e.currentTarget.dataset

    wx.previewImage({
      urls: images,
    })
  },

  showTip () {
    wx.showModal({
      title: '',
      content: '点击下方相机，发布一条动态吧',
      cancelText: '去逛逛',
      confirmText: '去发布',
      success: res => {
        if (res.confirm) {
          this.showForm()
        } else {
          wx.switchTab({
            url: '/pages/circle/index',
            success: res => {
              console.log('wx.switchTab.success: ', res)
            },
            fail: err => {
              console.error('wx.switchTab.fail: ', err)
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
    const cloudPath = `articles/image-${Date.now()}${filePath.match(/\.[^.]+?$/)[0]}`

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

    wx.showModal({
      title: '',
      content: '立即发表？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
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
        }
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
    const openid = app.globalData.openid

    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      })

      return
    }

    wx.requestSubscribeMessage({
      tmplIds: [
        'NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s',
      ],
      success: res => {
        console.log('[requestSubscribeMessage] 调用成功', res)

        if (res['NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s'] === 'accept') {
          this.formSubmit()

          const db = wx.cloud.database()

          const profiles = db.collection('profiles')

          profiles.where({
            _openid: openid,
          }).get().then(res => {
            console.log(res.data)

            try {
              const profile = res.data[0]
              const num = +profile.appointment || 0

              profiles.doc(profile._id).update({
                data: {
                  appointment: num + 1,
                },
              })
            } catch (e) {
              console.error(e)
            }
          })
        } else {
          wx.showToast({
            title: '请您接受订阅消息，否则无法收到通知',
            icon: 'none',
          })
        }
      },
      fail: err => {
        console.error('[requestSubscribeMessage] 调用失败', err)

        wx.showToast({
          title: '请您接受订阅消息，否则无法收到通知',
          icon: 'none',
        })
      },
    })
  },
})
