const alert = content => {
  wx.showModal({
    title: '提示',
    showCancel: false,
    content,
  })
}

export default alert
