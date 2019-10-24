//index.js

import { getMusicHome, } from '../../utils/actions'

import navigateTo from '../../utils/navigateTo'

const app = getApp()

Page({
  data: {
    musicHome: {},
  },
  onLoad (options) {
    console.log('Page.onLoad: ', options)
  },
  onShow () {
    this.getData()
  },
  onShareAppMessage (options) {
    return {
      title: '最权威的音乐排行榜',
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
  getData () {
    this.getMusicHomeAsync()
  },
  async getMusicHomeAsync () {
    try {
      const res = await getMusicHome()

      const data = res.data || {}

      const topList = data.topList || []

      this.setData({
        musicHome: {
          topList: topList.map(item => ({
            ...item,
            picUrl: item.picUrl.replace('http://', 'https://'),
          })),
        },
      })
    } catch (e) {
      console.error(e)
    }
  },
  musicTopList (event) {
    const { id } = event.currentTarget.dataset

    navigateTo(`/pages/topList/index?id=${id}`)
  },
})
