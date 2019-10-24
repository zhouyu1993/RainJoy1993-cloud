//index.js
import formatTime from '../../utils/formatTime'

const app = getApp()

Page({
  data: {
    avatarUrl: 'https://zhouyu1993.github.io/images/user-unlogin.png',

    openid: '',

    articles: [],
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()

    wx.setNavigationBarTitle({
      title: '微圈',
    })
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

          this.setData({
            openid,
          })

          app.globalData.openid = openid

          callback && callback(openid)
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
})
