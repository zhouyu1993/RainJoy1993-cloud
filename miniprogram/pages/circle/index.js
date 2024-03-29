//index.js

import formatTime from '../../utils/formatTime'

import navigateTo from '../../utils/navigateTo'

const app = getApp()

Page({
  data: {
    avatarUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/user-unlogin.png',

    openid: '',

    articles: [],

    cameraUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/camera.png',

    pageWidth: 0,
    pageHight: 0,
    medium: {
      src: '',
      width: 0,
      height: 0,
      hidden: true,
    },
  },
  onLoad (options) {
    const systemInfo = wx.getSystemInfoSync()

    const { windowWidth, screenWidth, windowHeight, screenHeight, } = systemInfo

    const pageWidth = windowWidth || screenWidth
    const pageHight = windowHeight || screenHeight

    this.setData({
      pageWidth,
      pageHight,
    })
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
      title: '微圈',
      path: '/pages/circle/index',
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

              app.globalData.userInfo = userInfo

              this.getOpenid(() => {
                this.getArticles(true)
              })
            },
          })
        } else {
          console.error('获取用户信息：未授权')

          this.getArticles(true)
        }
      }
    })
  },
  async getOpenid (callback) {
    const { userInfo, openid, } = app.globalData

    if (!openid) {
      // 调用云函数 login
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] 调用成功', res)

          const openid = res.result.openid

          this.setData({
            openid,
          })

          app.globalData.openid = openid

          callback && callback(openid)

          wx.aldstat.sendOpenid(openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        },
      })
    } else {
      this.setData({
        openid,
      })

      callback && callback(openid)
    }

    const db = wx.cloud.database()

    const profiles = db.collection('profiles')

    const count = await profiles.count()

    if (!count.total) {
      // 新增用户
      profiles.add({
        data: userInfo,
        success: res => {
          console.log('[数据库profiles] [add] 成功: ', res)
        },
        fail: err => {
          console.error('[数据库profiles] [add] 失败', err)
        },
      })
    } else {
      const res = await profiles.where({

      }).get()

      profiles.doc(res.data[0]._id).update({
        data: userInfo,
        success: res => {
          console.log('[数据库profiles] [update] 成功', res)
        },
        fail: err => {
          console.error('[数据库profiles] [update] 失败', err)
        },
      })
    }
  },

  getArticles (refresh = false) {
    const { articles = [], } = this.data

    const db = wx.cloud.database()

    // 获取文章
    db.collection('articles')
    .orderBy('timestamp', 'desc')
    .where({

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
    const { src = '', } = e.currentTarget.dataset

    this.setData({
      medium: {
        src,
      },
    })
  },
  imageLoad (e) {
    const { width, height, } = e.detail

    const { pageWidth, medium, } = this.data

    if (width > pageWidth) {
      medium.width = pageWidth
      medium.height = pageWidth / (width / height)
    }

    this.setData({
      medium: {
        ...medium,
        hidden: false,
      },
    })
  },
  previewHidden () {
    const { medium, } = this.data

    this.setData({
      medium: {
        ...medium,
        hidden: true,
      },
    })
  },
  downImage () {
    wx.showModal({
      title: '',
      content: '保存图片？',
      cancelText: '取消',
      confirmText: '保存',
      success: res => {
        if (res.confirm) {
          const { medium, } = this.data

          wx.cloud.downloadFile({
            fileID: medium.src,
            success: res => {
              console.log('wx.cloud.downloadFile.success: ', res)

              const { statusCode, tempFilePath, } = res

              if (statusCode === 200 && tempFilePath) {
                wx.saveImageToPhotosAlbum({
                  filePath: tempFilePath,
                  success: res => {
                    console.log('wx.saveImageToPhotosAlbum.success: ', res)
                  },
                  fail: err => {
                    console.error('wx.saveImageToPhotosAlbum.fail: ', err)
                  },
                })
              }
            },
            fail: err => {
              console.error('wx.cloud.downloadFile.fail: ', err)
            },
          })
        }
      },
    })
  },

  toMyCircle (e) {
    const { openid, } = e.currentTarget.dataset

    const url = (!openid || openid === this.data.openid) ? '/pages/myCircle/index' : `/pages/myCircle/index?openId=${openid}`

    navigateTo({
      url,
    })
  },
})
