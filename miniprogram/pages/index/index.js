//index.js

import formatTime from '../../utils/formatTime'

import navigateTo from '../../utils/navigateTo'

const app = getApp()

Page({
  data: {
    userInfo: null,

    clock: {},
    clockDate: [],
    clockDateNum: 0,
    canPunchClock: false,
  },
  onLoad (options) {
    console.log('Page.onLoad: ', options)

    const _this = this

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()

    const clock = {
      year,
      month,
      today: date,
      view: `date-${date - 4}`,
      _point: date,
      point: date,
      date: {},
    }

    function daysInMonth () {
      const now = new Date()
      const time = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return time.getDate()
    }

    const dates = [...new Array(daysInMonth())]

    const clockDate = dates.map((v, k) => {
      let d = k + 1
      const dd = d < 10 ? `0${d}` : d

      return {
        date: dd,
        title: `${clock.month}.${dd}`,
        state: clock.today === k + 1 ? 'now' : clock.point === k + 1 ? 'selected' : clock.today < k + 1 ? 'upcoming' : clock.date[k + 1] === 1 ? '' : 'fail'
      }
    })

    this.setData({
      clock,
      clockDate,
    })
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()
  },
  onShareAppMessage (options) {
    return {
      title: '打卡签到',
      path: '/pages/index/index',
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
                this.getClocks()
              })
            },
          })
        } else {
          console.error('获取用户信息：未授权')
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

    const db = wx.cloud.database()

    const profiles = db.collection('profiles')

    const count = await profiles.count()

    if (!count.total) {
      // 新增用户
      profiles.add({
        data: userInfo,
        success: res => {
          console.log('[数据库profiles] [add] 成功', res)
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

  toRank () {
    navigateTo({
      url: '/pages/rank/index'
    })
  },

  getClocks () {
    const openid = app.globalData.openid

    if (!openid) {
      return
    }

    const db = wx.cloud.database()

    // 获取签到
    db.collection('clocks')
    .where({
      _openid: openid,
    })
    .watch({
      onChange: res => {
        console.log('clocks.watch.onChange: ', res)

        const { docs = [], } = res

        const length = docs.length

        if (length) {
          const clock = this.data.clock

          docs.forEach(v => {
            const timestamp = v.timestamp

            const timeObj = formatTime(timestamp, '', true)

            clock.date[timeObj.DD] = 1
          })

          const dates = this.data.clockDate

          const clockDate = dates.map((v, k) => {
            let d = k + 1
            const dd = d < 10 ? `0${d}` : d

            return {
              date: dd,
              title: `${clock.month}.${dd}`,
              state: clock.today === k + 1 ? 'now' : clock.point === k + 1 ? 'selected' : clock.today < k + 1 ? 'upcoming' : clock.date[k + 1] === 1 ? '' : 'fail'
            }
          })

          this.setData({
            clock,
            clockDate,
            clockDateNum: length,
          })
        }

        this.data.canPunchClock = true
      },
      onError: err => {
        console.error('clocks.watch.onError: ', err)
      },
    })
  },

  changeClock (e) {
    const { date, } = e.currentTarget.dataset

    if (date < this.data.clock.today) return null

    const clock = this.data.clock

    clock.point = date
    clock._point = date
    clock.view = `date-${date - 4}`

    const dates = this.data.clockDate

    const clockDate = dates.map((v, k) => {
      let d = k + 1
      const dd = d < 10 ? `0${d}` : d

      return {
        date: dd,
        title: `${clock.month}.${dd}`,
        state: clock.today === k + 1 ? 'now' : clock.point === k + 1 ? 'selected' : clock.today < k + 1 ? 'upcoming' : clock.date[k + 1] === 1 ? '' : 'fail'
      }
    })

    this.setData({
      clock,
      clockDate,
    })
  },
  punchClock () {
    if (!this.data.canPunchClock) {
      wx.showToast({
        title: '数据还在加载中...',
        icon: 'none',
      })

      return
    }

    wx.showModal({
      title: '',
      content: '立即签到？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          const userInfo = app.globalData.userInfo

          const timestamp = Date.now()

          const db = wx.cloud.database()

          // 新增签到
          db.collection('clocks').add({
            data: {
              userInfo,
              timestamp,
            },
            success: res => {
              console.log('[数据库] [add] 成功', res)

              const clock = this.data.clock

              clock.date[clock.today] = 1

              this.setData({
                clock,
              })
            },
            fail: err => {
              console.error('[数据库] [add] 失败', err)

              wx.showToast({
                title: '签到失败',
                icon: 'none',
              })
            },
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

      let st = setTimeout(() => {
        wx.switchTab({
          url: '/pages/setting/index',
          success: res => {
            console.log('wx.switchTab.success: ', res)

            clearTimeout(st)

            st = null
          },
          fail: err => {
            console.error('wx.switchTab.fail: ', err)

            clearTimeout(st)

            st = null
          },
        })
      }, 300)

      return
    }

    wx.requestSubscribeMessage({
      tmplIds: [
        'NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s',
      ],
      success: res => {
        console.log('[requestSubscribeMessage] 调用成功', res)

        if (res['NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s'] === 'accept') {
          this.punchClock()

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
