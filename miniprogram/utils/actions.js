import { CYQQ, IYQQ, JITA, FANYI, GITLAB } from './api'
import promiseRequest from './promiseRequest'

const getHotKey = async () => {
  try {
    const res = await promiseRequest({
      url: `${CYQQ}/splcloud/fcgi-bin/gethotkey.fcg?format=json`,
      showLoading: false,
      fail: () => {},
      isSuccess: res => res.code === 0,
    })

    return res
  } catch (e) {
    throw e
  }
}

const getMusicHome = async () => {
  try {
    const res = await promiseRequest({
      url: `${CYQQ}/v8/fcg-bin/fcg_myqq_topList.fcg?format=json`,
      showLoading: true,
      fail: () => {},
      isSuccess: res => res.code === 0,
    })

    return res
  } catch (e) {
    throw e
  }
}

const getMusicTopList = async (id) => {
  try {
    const res = await promiseRequest({
      url: `${CYQQ}/v8/fcg-bin/fcg_v8_toplist_cp.fcg?topid=${id}&format=json`,
      showLoading: true,
      fail: () => {},
      isSuccess: res => res.code === 0,
    })

    return res
  } catch (e) {
    throw e
  }
}

const getMusicSrc = async (songmid) => {
  try {
    const res = await promiseRequest({
      url: `${IYQQ}/v8/playsong.html?songmid=${songmid}`,
      responseType: 'text',
      showLoading: true,
      fail: () => {},
      isSuccess: () => true,
    })

    const data = res

    /*eslint-disable no-useless-escape */
    const start = data.search(/<audio/ig)
    const end = data.search(/<\/audio/ig)
    const audioHtml = data.slice(start, end)
    const audioArr = audioHtml.split(' ')
    let songsrc = audioArr.find(item => /src=/.test(item))
    if (songsrc) {
      songsrc = songsrc.replace('src=', '').replace(/"/g, '')
    }

    if (songsrc) {
      let imgsrc = ''

      try {
        const start = data.search(/album_cover__img/ig)
        const data2 = data.slice(start)
        const end = data2.search(/\>/i)
        const imgHtml = data2.slice(0, end)
        const imgArr = imgHtml.split(' ')
        imgsrc = imgArr.find(item => /src=/.test(item))
        if (imgsrc) {
          imgsrc = imgsrc.replace('src=', '').replace(/"/g, '')
        }
        if (imgsrc) {
          imgsrc = imgsrc.search(/http(s?):/) < 0 ? 'https:' + imgsrc : imgsrc
        }

      } catch (e) {
        console.log(e)
      }

      return {
        songsrc,
        imgsrc,
      }
    }

    return {}
  } catch (e) {
    throw e
  }
}

const getJitaHome = async () => {
  try {
    const res = await promiseRequest({
      url: `${JITA}/api/home/index`,
      showLoading: true,
      fail: () => {},
      isSuccess: res => res.code === 1,
    })

    return res
  } catch (e) {
    throw e
  }
}

const getJitaSinger = async (id) => {
  try {
    const res = await promiseRequest({
      url: `${JITA}/api/home/index/singer_detail?id=${id}`,
      showLoading: true,
      fail: () => {},
      isSuccess: res => res.code === 1,
    })

    return res
  } catch (e) {
    throw e
  }
}

const getJitaSong = async (id) => {
  try {
    const res = await promiseRequest({
      url: `${JITA}/api/home/index/pu?id=${id}`,
      showLoading: true,
      fail: () => {},
      isSuccess: res => res.code === 1,
    })

    return res
  } catch (e) {
    throw e
  }
}

const searchJita = async (key) => {
  try {
    const res = await promiseRequest({
      url: `${JITA}/api/home/index/search?key=${key}`,
      showLoading: true,
      fail: () => {},
      isSuccess: res => res.code === 1,
    })

    return res
  } catch (e) {
    throw e
  }
}

const langDetect = async (value) => {
  const res = await promiseRequest({
    url: `${FANYI}/langdetect`,
    data: {
      query: value,
    },
    method: 'POST',
    showLoading: false,
    fail: () => {},
    isSuccess: res => res.error === 0,
  })

  return res
}

const getRainJoy1993Config = async () => {
  try {
    const res = await promiseRequest({
      url: `${GITLAB}/zhouyu1993/wx-miniprogram-config/raw/master/RainJoy1993/config.json`,
      showLoading: false,
      fail: () => {},
      isSuccess: res => res.code === 0,
    })

    return res
  } catch (e) {
    throw e
  }
}

export {
  getHotKey,
  getMusicHome,
  getMusicTopList,
  getMusicSrc,
  getJitaHome,
  getJitaSinger,
  getJitaSong,
  searchJita,
  langDetect,
  getRainJoy1993Config,
}
