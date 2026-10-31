/** 天气图标（emoji 字形，避免额外位图依赖） */
export const WEATHER_GLYPHS: Record<string, string> = {
  sun: '☀️',
  'sun-cloud': '⛅',
  cloud: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
}

/** 按 WMO code 直接取字形，供逐小时/逐日列表使用 */
export function glyphOf(codeOrIcon: number | string): string {
  if (typeof codeOrIcon === 'string') return WEATHER_GLYPHS[codeOrIcon] ?? '☁️'
  if (codeOrIcon === 0) return '☀️'
  if (codeOrIcon <= 2) return '⛅'
  if (codeOrIcon === 3) return '☁️'
  if (codeOrIcon <= 48) return '🌫️'
  if (codeOrIcon <= 57) return '🌦️'
  if (codeOrIcon <= 67) return '🌧️'
  if (codeOrIcon <= 77) return '❄️'
  if (codeOrIcon <= 82) return '🌧️'
  if (codeOrIcon <= 86) return '❄️'
  return '⛈️'
}
