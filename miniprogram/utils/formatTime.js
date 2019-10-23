const formatNumber = input => {
  return input < 10 ? `0${input}` : `${input}`
}

const splitTime = date => {
  return {
    'YY': date.getFullYear(),
    'MM': date.getMonth() + 1,
    'DD': date.getDate(),
    'WW': date.getDay(),
    'hh': date.getHours(),
    'mm': date.getMinutes(),
    'ss': date.getSeconds(),
  }
}

const formatTime = (time, format = 'YY-MM-DD hh:mm:ss', original = false) => {
  const date = new Date(+time)

  if (+date !== 0 && !+date) return format

  if (!format || typeof format !== 'string') {
    format = 'YY-MM-DD hh:mm:ss'
  }

  const t = splitTime(date)

  if (original) return t

  let formatTime = ''
  for (let key in t) {
    formatTime = format.replace(key, formatNumber(t[key]))
    format = formatTime
  }

  return formatTime
}

export default formatTime
