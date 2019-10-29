//index.js

const app = getApp()

Page({
  data: {
    money: 10000,
    shebao: 1500,
    gongjijin: 2000,
    zhuanxiang: 1000,
    taxSum: 0,
    taxs: [],
    youMoneySum: 0,
    youMoneys: [],
  },
  onShareAppMessage (options) {
    return {
      title: '工资计算器',
      path: '/pages/calculator/index',
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

  moneyChange (e) {
    const { value, } = e.detail

    this.setData({
      money: value,
    })
  },
  shebaoChange (e) {
    const { value, } = e.detail

    this.setData({
      shebao: value,
    })
  },
  gongjijinChange (e) {
    const { value, } = e.detail

    this.setData({
      gongjijin: value,
    })
  },
  zhuanxiangChange (e) {
    const { value, } = e.detail

    this.setData({
      zhuanxiang: value,
    })
  },
  calculator (money, shebao, gongjijin, zhuanxiang) {
    var ed = money - shebao - gongjijin - zhuanxiang - 5000

    if (ed <= 0) {
      wx.showToast({
        title: '你不用交税',
        icon: 'none',
      })

      return {
        taxSum: 0,
        taxs: 0,
        youMoneySum: 0,
        youMoneys: 0,
      }
    }

    var taxSum = 0
    var taxs = []
    var youMoneySum = 0
    var youMoneys = []

    for (var i = 1; i <= 12; i++) {
      var eds = ed * i

      var tax = 0
      if (eds <= 36000) {
        tax = eds * 0.03 - taxSum
      } else if (eds > 36000 && eds <= 144000) {
        tax = eds * 0.1 - 2520 - taxSum
      } else if (eds > 144000 && eds <= 300000) {
        tax = eds * 0.2 - 16920 - taxSum
      } else if (eds > 300000 && eds <= 420000) {
        tax = eds * 0.25 - 31920 - taxSum
      } else if (eds > 420000 && eds <= 660000) {
        tax = eds * 0.3 - 52920 - taxSum
      } else if (eds > 660000 && eds <= 960000) {
        tax = eds * 0.35 - 85920 - taxSum
      } else if (eds > 960000) {
        tax = eds * 0.45 - 181920 - taxSum
      }
      taxSum += tax

      var youMoney = money - shebao - gongjijin - tax

      youMoneySum += youMoney

      taxs.push(tax)
      youMoneys.push(youMoney)
    }

    return {
      taxSum,
      taxs,
      youMoneySum,
      youMoneys,
    }
  },
  submit () {
    const {
      taxSum,
      taxs,
      youMoneySum,
      youMoneys,
    } = this.calculator(this.data.money, this.data.shebao, this.data.gongjijin, this.data.zhuanxiang)

    this.setData({
      taxSum,
      taxs,
      youMoneySum,
      youMoneys,
    })
  },
})
