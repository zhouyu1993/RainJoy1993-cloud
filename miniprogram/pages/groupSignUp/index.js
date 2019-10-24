//index.js

import formatTime from '../../utils/formatTime'

const app = getApp()

Page({
  data: {
    logged: false,
    userInfo: null,
    avatarUrl: 'https://zhouyu1993.github.io/images/user-unlogin.png',
    nickName: '点击登录',

    openid: '',
    openGId: '',
    admin: false,

    list: [],

    amounts: [],

    plusUrl: 'https://zhouyu1993.github.io/images/plus.png',
    addressUrl: 'https://zhouyu1993.github.io/images/location.png',
    visible: false,
    textarea: '',
    address: {},
  },
  onShow () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')

      return
    }

    this.getUserInfo()

    const { shareTicket, } = app.globalData

    console.log('shareTicket: ', shareTicket)

    if (!shareTicket) {
      wx.showToast({
        title: '请在微信群内点击小程序参加',
        icon: 'none',
      })

      return
    }

    wx.getShareInfo({
      shareTicket,
      success: res => {
        console.log('wx.getShareInfo.success: ', res)

        const { cloudID = '', } = res

        // 获取群信息
        // 调用云函数 cx
        wx.cloud.callFunction({
          name: 'cx',
          data: {
            openData: wx.cloud.CloudID(cloudID),
          },
          success: res => {
            console.log('[云函数] [cx] 调用成功', res)

            try {
              const { openData = {}, } = res.result.event

              const { openGId = '', } = openData.data

              this.setData({
                openGId,
              })

              this.getGroups(openGId)
            } catch (e) {
              console.error(e)
            }
          },
          fail: err => {
            console.error('[云函数] [cx] 调用失败', err)
          },
        })
      },
    })
  },
  onShareAppMessage (options) {
    return {
      title: '快来参加拼团报名吧',
      path: '/pages/groupSignUp/index',
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
  async getOpenid (callback) {
    const db = wx.cloud.database()

    let administrators = [
      {
        openid: 'oSfYh0aXrNuSzCq7RbWq-oh_zNTg',
      },
    ]

    try {
      // 获取管理员
      const result = await db.collection('administrators')
      .where({

      })
      .get()

      administrators = result.data
    } catch (e) {
      console.error(e)
    }

    const openid = app.globalData.openid

    if (!openid) {
      // 调用云函数 login
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] 调用成功', res)

          const openid = res.result.openid

          const admin = administrators.some(administrator => administrator.openid === openid)

          this.setData({
            openid,
            admin,
          })

          app.globalData.openid = openid

          callback && callback(openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        },
      })
    } else {
      const admin = administrators.some(administrator => administrator.openid === openid)

      this.setData({
        openid,
        admin,
      })

      callback && callback(openid)
    }
  },

  getGroups (openGId = '') {
    if (!openGId) {
      wx.showToast({
        title: '请在微信群内点击小程序参加',
        icon: 'none',
      })

      return
    }

    const db = wx.cloud.database()

    // 获取微信群
    db.collection('groups')
    .where({
      openGId,
      state: 0,
    })
    .watch({
      onChange: res => {
        console.log('groups.watch.onChange: ', res)

        const { docs = [], } = res

        const obj = {}
        docs.forEach(doc => {
          const timestamp = doc.timestamp

          doc.time = formatTime(timestamp)

          obj[doc._openid] = doc
        })

        let list = []
        for (let key in obj) {
          list.push(obj[key])
        }

        this.setData({
          list,
        })
      },
      onError: err => {
        console.error('groups.watch.onError: ', err)
      },
    })
  },
  delete (e) {
    const { id, } = e.currentTarget.dataset

    wx.showModal({
      title: '',
      content: '确定删除吗？',
      cancelText: '取消',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          const db = wx.cloud.database()

          // 获取报名信息
          const groupSignUp = db.collection('groups').doc(id)

          groupSignUp.update({
            data: {
              state: 2,
            },
            success: res => {
              console.log('groupSignUp.update.success: ', res)

              if (res.stats.uodated) {
                wx.showToast({
                  title: '删除成功',
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none',
                })
              }
            },
            fail: err => {
              console.error('groupSignUp.update.fail: ', err)

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
  setClipboardDataOne (e) {
    const { data = {}, } = e.currentTarget.dataset

    this.setClipboardData(`${data.userInfo.nickName} ${data.textarea} ${data.time}`)
  },
  setClipboardDataAll () {
    const { list = [], } = this.data

    if (list.length) {
      let data = ''
      list.forEach((item, index) => {
        data += `${index + 1}、${item.userInfo.nickName} ${item.textarea} ${item.time}

`
      })

      this.setClipboardData(data)
    }
  },
  setClipboardData (data = '') {
    wx.setClipboardData({
      data,
      success: res => {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
        })
      },
    })
  },

  amountInput (e) {
    const { index, } = e.currentTarget.dataset
    const { value, } = e.detail

    const { amounts = [], } = this.data

    amounts[index] = value

    this.setData({
      amounts,
    })
  },
  notify (e) {
    const { index, id, openid, textarea, } = e.currentTarget.dataset

    const { amounts = [], } = this.data

    const amount = amounts[index]

    if (!amount) {
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
      })

      return
    }

    // 通知用户
    // 调用云函数 openapi
    wx.cloud.callFunction({
      name: 'openapi',
      data: {
        action: 'sendSubscribeMessage',
        touser: openid,
        templateId: 'TydTAuzjG8ufiZyy8uavgY_1j8cVuIT5Vsw-3V2HLcM',
        page: `pages/myCircle/index?groupSignUpId=${id}`,
        data: {
          thing1: {
            value: '拼团报名' || '活动名称',
          },
          amount2: {
            value: `${amount}元` || '订单金额',
          },
          thing3: {
            value: textarea || '订单内容',
          },
          name4: {
            value: 'RainJoy' || '商家名称',
          },
          thing5: {
            value: '请尽快领取，有时间麻烦发条好评～' || '温馨提示',
          },
        },
      },
      success: res => {
        console.log('[云函数] [openapi] 调用成功', res)

        const errCode = res && res.result && res.result.errCode

        if (res.result.errCode === 0) {
          wx.showToast({
            title: '通知成功',
          })
        } else {
          wx.showToast({
            title: '通知失败',
            icon: 'none',
          })
        }
      },
      fail: err => {
        console.error('[云函数] [openapi] 调用失败', err)

        wx.showToast({
          title: '通知失败',
          icon: 'none',
        })
      },
    })
  },

  showForm () {
    const { openGId = '', } = this.data

    if (!openGId) {
      wx.showToast({
        title: '请在微信群内点击小程序参加',
        icon: 'none',
      })

      return
    }

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
  textareaInput (e) {
    const { value, } = e.detail

    this.setData({
      textarea: value,
    })
  },
  chooseAddress () {
    // 选择收货地址
    wx.chooseAddress({
      success: res => {
        console.log('[选择收货地址] 成功：', res)

        this.setData({
          address: res,
        })
      },
      fail: err => {
        console.error('[选择收货地址] 失败：', err)
      },
    })
  },
  formSubmit () {
    const { userInfo = {}, openGId = '', textarea = '', address = {}, } = this.data

    if (!textarea) {
      wx.showToast({
        title: '请输入',
        icon: 'none',
      })

      return
    }

    const timestamp = Date.now()

    const db = wx.cloud.database()

    // 新增微信群的报名
    db.collection('groups').add({
      data: {
        userInfo,
        openGId,
        textarea,
        address,
        timestamp,
        state: 0,
      },
      success: res => {
        console.log('[数据库] [add] 成功: ', res)

        wx.showToast({
          title: '报名成功',
        })

        this.setData({
          visible: false,
          textarea: '',
          address: {},
        })
      },
      fail: err => {
        console.error('[数据库] [add] 失败：', err)

        wx.showToast({
          title: '报名失败',
          icon: 'none',
        })
      },
    })
  },
  formCancel () {
    const { textarea = '', } = this.data

    if (!textarea) {
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
            address: {},
          })
        }
      },
    })
  },

  subscribe () {
    wx.requestSubscribeMessage({
      tmplIds: [
        'NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s',
        'TydTAuzjG8ufiZyy8uavgY_1j8cVuIT5Vsw-3V2HLcM',
      ],
      success: res => {
        console.log('[requestSubscribeMessage] 调用成功', res)

        if (res['NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s'] === 'accept' && res['TydTAuzjG8ufiZyy8uavgY_1j8cVuIT5Vsw-3V2HLcM'] === 'accept') {
          this.formSubmit()
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

  subscribe2 () {
    wx.requestSubscribeMessage({
      tmplIds: [
        'NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s',
      ],
      success: res => {
        console.log('[requestSubscribeMessage] 调用成功', res)

        if (res['NZCSyE7gGWwW3--We94fpJt3S0JV9FNqMQBqFpsW78s'] === 'accept') {
          wx.showToast({
            title: '预约成功',
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
