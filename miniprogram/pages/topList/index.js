//index.js

import { getMusicTopList } from '../../utils/actions'

import navigateTo from '../../utils/navigateTo'

Page({
  data: {
    id: '',
    musicTopList: {},
  },
  onLoad (options) {
    console.log('Page.onLoad: ', options)

    const { id, } = options

    this.setData({
      id,
    })
  },
  onShow () {
    this.getData()
  },
  onShareAppMessage (options) {
    return {
      title: (this.data.musicTopList && this.data.musicTopList.topinfo && this.data.musicTopList.topinfo.ListName) || '排行榜',
      path: `/pages/topList/index?id=${this.data.id}`,
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
  async getData () {
    const id = this.data.id
    if (!id) return

    const res = await getMusicTopList(id)

    this.setData({
      musicTopList: res,
    })

    if (res.topinfo && res.topinfo.ListName) {
      wx.setNavigationBarTitle({
        title: res.topinfo.ListName
      })
    }
  },
  showInfo (event) {
    const { text, } = event.currentTarget.dataset

    if (text) {
      wx.showToast({
        title: text,
        icon: 'none',
      })
    }
  },
  musicSong (event) {
    const { songmid = '', songname = '未知歌曲', albumname = '未知专辑', singername = '未知歌手', } = event.currentTarget.dataset

    // navigateTo(`/pages/song/index?songmid=${songmid}&songname=${songname}&albumname=${albumname}&singername=${singername}`)

    wx.showToast({
      title: `这是${singername}演唱的《${songname}》`,
      icon: 'none',
    })
  },
})