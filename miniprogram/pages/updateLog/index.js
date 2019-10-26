//index.js

const app = getApp()

Page({
  data: {
    avatar: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/avatar.png',
    name: 'RainJoy',
    intro: '前端研发工程师',
    logs: [
      '1.0.0: 第一次发版',
      '1.0.1: 增加吉他曲谱',
      '1.0.2: 增加音乐搜索',
      '1.0.3: 增加小说搜索',
      '1.0.4: 增加外卖搜索',
      '1.0.5: 使用新脚手架',
      '2.0.0: 使用云开发',
      '2.0.1: 静态资源上传云平台；新增打卡签到',
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
