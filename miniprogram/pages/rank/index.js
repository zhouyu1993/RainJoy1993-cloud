//index.js

import formatTime from '../../utils/formatTime'

const app = getApp()

Page({
  data: {
    avatarUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/user-unlogin.png',

    hover: 0,
    rank1: [],
    rank2: [],
  },
  onLoad (options) {
    console.log('Page.onLoad: ', options)
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getClocks()
  },
  onShareAppMessage (options) {
    return {
      title: '签到排行榜',
      path: '/pages/rank/index',
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

  getClocks () {
    const db = wx.cloud.database()

    // 获取签到
    db.collection('clocks')
    .watch({
      onChange: res => {
        console.log('clocks.watch.onChange: ', res)

        const { docs = [], } = res

        const length = docs.length

        if (length) {
          const obj = {}
          const list1 = []
          const list2 = []

          const today = formatTime(Date.now(), 'YY-MM-DD')

          docs.forEach(v => {
            const { _openid, timestamp, userInfo, } = v

            if (obj[_openid]) {
              obj[_openid].count ++
            } else {
              obj[_openid] = {
                count: 1,
                userInfo,
              }
            }

            const date = formatTime(timestamp, 'YY-MM-DD')

            if (today === date) {
              list2.push({
                ...v,
                time: formatTime(timestamp),
              })
            }
          })

          for (let key in obj) {
            list1.push(obj[key])
          }

          this.setData({
            rank1: list1.sort((a, b) => b.count - a.count),
            rank2: list2.sort((a, b) => a.timestamp - b.timestamp),
          })
        }
      },
      onError: err => {
        console.error('clocks.watch.onError: ', err)
      },
    })
  },

  tab1 () {
    this.setData({
      hover: 0,
    })
  },
  tab2 () {
    this.setData({
      hover: 1,
    })
  },

  showRule () {
    const content = this.data.hover === 0 ? '【总排行榜】依据签到人的总签到次数排序，次数多者排前。' : '【日排行榜】依据签到人当日签到时间记录，时间最近者排前。'

    wx.showModal({
      title: '排行榜规则',
      showCancel: false,
      content,
      confirmText: '我知道了',
    })
  },
})
