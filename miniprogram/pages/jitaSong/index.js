//index.js

import { getJitaSong } from '../../utils/actions'

import navigateTo from '../../utils/navigateTo'

Page({
  data: {
    id: '',
    jitaSong: {},
  },
  onLoad (options) {
    console.log('Page.onLoad: ', options)

    const { id, } = options

    if (id) {
      this.setData({
        id,
      })

      this.getJitaSongAsync()
    }
  },
  onShow () {

  },
  onShareAppMessage (options) {
    let title = '吉他曲谱'

    if (this.data.jitaSong.title && this.data.jitaSong.singer) {
      title = `${this.data.jitaSong.title}-${this.data.jitaSong.singer}-吉他曲谱`
    }

    return {
      title,
      path: `/pages/jitaSong/index?id=${this.data.id}`,
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
  async getJitaSongAsync () {
    const id = this.data.id
    if (!id) return

    const res = await getJitaSong(id)

    const jitaSong = res.data || {}

    this.setData({
      jitaSong,
    })

    if (jitaSong.title && jitaSong.singer) {
      wx.setNavigationBarTitle({
        title: `${jitaSong.title}-${jitaSong.singer}`
      })
    }
  },
  toJitaSinger (event) {
    const { id } = event.currentTarget.dataset

    navigateTo(`/pages/jitaSinger/index?id=${id}`)
  },
})
