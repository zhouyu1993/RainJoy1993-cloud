//index.js

const app = getApp()

Page({
  data: {
    avatar: 'https://zhouyu1993.github.io/images/avatar.png',
    name: 'RainJoy',
    intro: '前端研发工程师',
    logs: [
      '1.0.0: 第一次发版',
      '1.0.1: 增加吉他曲谱',
      '1.0.2: 增加音乐搜索',
      '1.0.3: 增加小说搜索',
      '1.0.4: 增加外卖搜索',
      '1.0.5: 使用新脚手架',
      '2.0.0: 使用云开发'
    ],
  },
  onShareAppMessage (options) {
    return {
      title: '更新日志',
      path: '/pages/updateLog/index',
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
})
