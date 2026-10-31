/** WMO 天气代码 -> 中文描述与图标（open-meteo 使用 WMO 4677 编码） */

const WEATHER_TABLE: { codes: number[]; text: string; icon: string }[] = [
  { codes: [0], text: '晴', icon: 'sun' },
  { codes: [1], text: '晴间多云', icon: 'sun-cloud' },
  { codes: [2], text: '多云', icon: 'cloud' },
  { codes: [3], text: '阴', icon: 'cloud' },
  { codes: [45, 48], text: '有雾', icon: 'fog' },
  { codes: [51, 53, 55, 56, 57], text: '毛毛雨', icon: 'drizzle' },
  { codes: [61, 63, 65, 66, 67], text: '雨', icon: 'rain' },
  { codes: [71, 73, 75, 77], text: '雪', icon: 'snow' },
  { codes: [80, 81, 82], text: '阵雨', icon: 'rain' },
  { codes: [85, 86], text: '阵雪', icon: 'snow' },
  { codes: [95, 96, 99], text: '雷雨', icon: 'storm' },
]

export function weatherText(code: number): string {
  const hit = WEATHER_TABLE.find((item) => item.codes.includes(code))
  return hit ? hit.text : '多云'
}

export function weatherIcon(code: number): string {
  const hit = WEATHER_TABLE.find((item) => item.codes.includes(code))
  return hit ? hit.icon : 'cloud'
}

/** 带单位的气温文案 */
export function temperatureText(value: number): string {
  return Math.round(value) + '°'
}

/** 体感描述，用于页眉提示 */
export function comfortTip(temperature: number, code: number): string {
  if (code >= 51) return '有降水，记得带伞'
  if (temperature >= 30) return '天气偏热，注意防晒补水'
  if (temperature <= 8) return '气温较低，注意保暖'
  if (temperature >= 18 && temperature <= 26) return '气温舒适，适合出行'
  return '出行前请查看最新预报'
}
