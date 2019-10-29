//index.js

import { getMusicTopList, getMusicSrc } from '../../utils/actions'

import navigateTo from '../../utils/navigateTo'

const backgroundAudioManager = wx.getBackgroundAudioManager()

Page({
  data: {
    id: '',
    musicTopList: {},

    showIndex: '',
  },
  onLoad (options) {
    console.log('Page.onLoad: ', options, backgroundAudioManager)

    const { id, } = options

    let showIndex = ''
    if (id === backgroundAudioManager.id) {
      showIndex = backgroundAudioManager.activeIndex
    }

    this.setData({
      id,
      showIndex,
    })

    this.getMusicTopList()

    backgroundAudioManager.onPrev(() => {
      console.log('backgroundAudioManager.onPrev')

      this.prevSong()
    })

    backgroundAudioManager.onNext(() => {
      console.log('backgroundAudioManager.onNext')

      this.nextSong()
    })

    backgroundAudioManager.onEnded(() => {
      console.log('backgroundAudioManager.onEnded')

      this.nextSong()
    })

    backgroundAudioManager.onError(() => {
      console.log('backgroundAudioManager.onError')

      backgroundAudioManager.id = ''
      backgroundAudioManager.songlist = []
      backgroundAudioManager.activeIndex = ''

      this.setData({
        showIndex: '',
      })
    })

    backgroundAudioManager.onStop(() => {
      console.log('backgroundAudioManager.onStop')

      backgroundAudioManager.id = ''
      backgroundAudioManager.songlist = []
      backgroundAudioManager.activeIndex = ''

      this.setData({
        showIndex: '',
      })
    })

    backgroundAudioManager.onPlay(() => {
      console.log('backgroundAudioManager.onPlay')
    })

    backgroundAudioManager.onPause(() => {
      console.log('backgroundAudioManager.onPause')
    })
  },
  onShow () {

  },
  onShareAppMessage (options) {
    return {
      title: (this.data.musicTopList && this.data.musicTopList.topinfo && this.data.musicTopList.topinfo.ListName) || '史上最权威的音乐排行榜',
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

  async getMusicTopList () {
    const id = this.data.id
    if (!id) return

    const res = await getMusicTopList(id)

    const pic_album = res.topinfo && res.topinfo.pic_album
    if (res.topinfo.pic_album) {
      res.topinfo.pic_album = pic_album.replace('http://', 'https://')
    }

    const songlist = res.songlist || []

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

  playSong (event) {
    const { index, } = event.currentTarget.dataset

    if (index === this.data.showIndex) {
      console.log(backgroundAudioManager.paused)

      backgroundAudioManager.paused ? backgroundAudioManager.play() : backgroundAudioManager.pause()

      return
    }

    backgroundAudioManager.id = this.data.id
    backgroundAudioManager.songlist = this.data.musicTopList.songlist
    backgroundAudioManager.activeIndex = index

    console.log('playSong: ', index)

    this.toPlaySong(index)
  },
  prevSong () {
    const songlist = backgroundAudioManager.songlist

    const activeIndex = backgroundAudioManager.activeIndex

    const index = activeIndex === 0 ? songlist.length - 1 : activeIndex - 1

    backgroundAudioManager.activeIndex = index

    console.log('prevSong: ', index)

    this.toPlaySong(index)
  },
  nextSong () {
    const songlist = backgroundAudioManager.songlist

    const activeIndex = backgroundAudioManager.activeIndex

    const index = activeIndex === songlist.length - 1 ? 0 : activeIndex + 1

    backgroundAudioManager.activeIndex = index

    console.log('nextSong: ', index)

    this.toPlaySong(index)
  },
  async toPlaySong (index) {
    try {
      const songlist = backgroundAudioManager.songlist || this.data.musicTopList.songlist
      const data = songlist[index].data
      const { songmid, songname, albumname, singer = [], } = data

      if (songmid) {
        const singername = singer.map(item => item.name).join(' ')

        const { songsrc, imgsrc, } = await getMusicSrc(songmid)

        console.log(songname, '||' , albumname, '||', singername, '||', songsrc, '||', imgsrc)

        if (songsrc) {
          backgroundAudioManager.title = songname || '未知歌曲'
          backgroundAudioManager.epname = albumname || '未知专辑'
          backgroundAudioManager.singer = singername || '未知歌手'
          backgroundAudioManager.coverImgUrl = imgsrc || 'https://api.ixiaowai.cn/gqapi/gqapi.php'
          backgroundAudioManager.src = songsrc

          const { id, } = this.data

          let showIndex = ''
          if (id === backgroundAudioManager.id) {
            showIndex = backgroundAudioManager.activeIndex
          }

          this.setData({
            showIndex,
          })
        } else {
          wx.showToast({
            title: '版权问题不支持播放',
            icon: 'none',
          })

          let st = setTimeout(() => {
            this.nextSong()

            clearTimeout(st)

            st = null
          }, 1000)
        }
      } else {
        wx.showToast({
          title: '版权问题不支持播放',
          icon: 'none',
        })

        let st = setTimeout(() => {
          this.nextSong()

          clearTimeout(st)

          st = null
        }, 1000)
      }
    } catch (e) {
      console.log(e)

      wx.showToast({
        title: '网络异常',
        icon: 'none',
      })

      let st = setTimeout(() => {
        this.nextSong()

        clearTimeout(st)

        st = null
      }, 1000)
    }
  },
})
