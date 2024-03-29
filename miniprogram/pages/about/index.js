//index.js

const app = getApp()

Page({
  data: {
    avatar: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/avatar.png',
    name: 'RainJoy',
    intro: '前端研发工程师',
    aphorisms: [
      '前事不忘，后事之师',
      '往事不可谏，来者犹可追',
      '玉树临风美少年，揽镜自顾夜不眠',
      '不知入夜能来否，红蜡先教刻五分',
    ],
  },
  onShareAppMessage (options) {
    return {
      title: '关于作者',
      path: '/pages/about/index',
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
