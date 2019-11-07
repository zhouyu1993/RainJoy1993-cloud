//index.js

const app = getApp()

Page({
  data: {
    imgUrl: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/assets/avatar.png',
    fileID: 'cloud://development-6cz0i.6465-development-6cz0i-1255810278/albums/image-1573036909233.jpg',

    faceRects: {},
    resMap: {
      Gender: {
        label: "性别",
        valMap: { 0: "女", 1: "男" }
      },
      Age: { label: "年龄" },
      Expression: {
        label: "微笑",
        valMap: { 0: "否", 1: "是" }
      },
      Glass: { label: "是否有眼镜" },
      Beauty: { label: "魅力" },
      Hat: { label: "是否有帽子" },
      Mask: { label: "是否有口罩" },
      Score: { label: "质量分" },
      Sharpness: { label: "清晰分" },
      Brightness: { label: "光照分" }
    },
  },
  onShareAppMessage (options) {
    return {
      title: 'AI相册',
      path: '/pages/aiAlbum/index',
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

  chooseImage () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.showLoading({
          title: '上传中',
        })

        const tempFilePaths = res.tempFilePaths

        tempFilePaths.forEach(filePath => {
          this.uploadFile(filePath)
        })
      },
    })
  },
  uploadFile (filePath) {
    // 上传图片
    const cloudPath = `albums/image-${Date.now()}${filePath.match(/\.[^.]+?$/)[0]}`

    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)

        wx.hideLoading()

        const fileID = res.fileID

        this.setData({
          fileID,
          faceRects: '',
        })
      },
      fail: err => {
        console.error('[上传文件] 失败：', err)

        wx.showToast({
          title: '上传失败',
          icon: 'none',
        })
      },
    })
  },

  async detectImage () {
    wx.showLoading({
      title: '识别中',
    })

    try {
      const { result } = await wx.cloud.callFunction({
        name: "tcbService-ai-detectFace",
        data: {
          FileID: this.data.fileID,
        }
      })

      console.log(result)

      wx.hideLoading()

      if (!result.code && result.data) {
        this.setData({
          faceRects: this.getFaceRects(result.data),
        })
      } else {
        console.error(result)

        wx.showToast({
          title: result.message || '系统异常',
          icon: 'none',
        })
      }
    } catch (e) {
      console.error(e)
    }
  },

  // 计算人脸位置
  getFaceRects(res) {
    const { ImageWidth, ImageHeight, FaceInfos } = res
    let item = FaceInfos[0]

    return [
      {
        ...item,
        imageWidth: ImageWidth,
        imageHeight: ImageHeight,
        rectX: item.X / ImageWidth,
        rectY: item.Y / ImageHeight,
        rectWidth: item.Width / ImageWidth,
        rectHeight: item.Height / ImageHeight
      }
    ]
  },
})
