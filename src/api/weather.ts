import type { WeatherNow } from '@/types'
import { weatherIcon, weatherText } from '@/utils/weather'

/** 成都市中心坐标（天府广场） */
export const CHENGDU = { latitude: 30.6598, longitude: 104.0633, name: '成都' }

const ENDPOINT =
  'https://api.open-meteo.com/v1/forecast?latitude=' +
  CHENGDU.latitude +
  '&longitude=' +
  CHENGDU.longitude +
  '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
  '&hourly=temperature_2m,weather_code&forecast_days=2' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5' +
  '&timezone=Asia%2FShanghai'

const CACHE_KEY = 'cd-weather-cache-v1'
const CACHE_TTL = 30 * 60 * 1000

interface CachePayload {
  savedAt: number
  data: WeatherNow
}

/** 离线兜底数据（接口不可用时使用，保证页眉始终有内容） */
export function fallbackWeather(): WeatherNow {
  const now = new Date()
  const hourly = Array.from({ length: 6 }, (_, i) => {
    const t = new Date(now.getTime() + i * 3600 * 1000)
    return {
      time: String(t.getHours()).padStart(2, '0') + ':00',
      temperature: 21 + Math.round(Math.sin(i / 2) * 2),
      code: 2,
    }
  })
  const daily = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400000)
    return {
      date: d.getMonth() + 1 + '/' + d.getDate(),
      max: 24 + (i % 3),
      min: 15 + (i % 2),
      text: weatherText(2),
      icon: weatherIcon(2),
    }
  })
  return {
    city: CHENGDU.name,
    temperature: 21,
    apparent: 22,
    humidity: 68,
    wind: 2.4,
    code: 2,
    text: weatherText(2),
    icon: weatherIcon(2),
    updatedAt: now.toISOString(),
    source: 'fallback',
    hourly,
    daily,
  }
}

function readCache(): WeatherNow | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const payload = JSON.parse(raw) as CachePayload
    if (!payload || typeof payload.savedAt !== 'number') return null
    if (Date.now() - payload.savedAt > CACHE_TTL) return null
    return payload.data
  } catch {
    return null
  }
}

function writeCache(data: WeatherNow) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data } satisfies CachePayload))
  } catch {
    /* 隐私模式下 localStorage 可能不可写，忽略即可 */
  }
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number
    relative_humidity_2m?: number
    apparent_temperature?: number
    weather_code?: number
    wind_speed_10m?: number
  }
  hourly?: {
    time?: string[]
    temperature_2m?: number[]
    weather_code?: number[]
  }
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

function normalize(payload: OpenMeteoResponse): WeatherNow {
  const current = payload.current ?? {}
  const code = current.weather_code ?? 2
  const hourlyTime = payload.hourly?.time ?? []
  const hourlyTemp = payload.hourly?.temperature_2m ?? []
  const hourlyCode = payload.hourly?.weather_code ?? []
  const startIndex = hourlyTime.findIndex((t) => new Date(t).getTime() >= Date.now() - 3600 * 1000)
  const from = startIndex >= 0 ? startIndex : 0
  const hourly = hourlyTime.slice(from, from + 8).map((time, i) => ({
    time: String(new Date(time).getHours()).padStart(2, '0') + ':00',
    temperature: Math.round(hourlyTemp[from + i] ?? 0),
    code: hourlyCode[from + i] ?? 0,
  }))

  const daily = (payload.daily?.time ?? []).slice(0, 5).map((date, i) => {
    const d = new Date(date)
    const c = payload.daily?.weather_code?.[i] ?? 0
    return {
      date: d.getMonth() + 1 + '/' + d.getDate(),
      max: Math.round(payload.daily?.temperature_2m_max?.[i] ?? 0),
      min: Math.round(payload.daily?.temperature_2m_min?.[i] ?? 0),
      text: weatherText(c),
      icon: weatherIcon(c),
    }
  })

  return {
    city: CHENGDU.name,
    temperature: Math.round(current.temperature_2m ?? 0),
    apparent: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    wind: Math.round((current.wind_speed_10m ?? 0) * 10) / 10,
    code,
    text: weatherText(code),
    icon: weatherIcon(code),
    updatedAt: new Date().toISOString(),
    source: 'online',
    hourly,
    daily,
  }
}

/**
 * 获取成都实时天气。
 * 策略：内存缓存 -> localStorage（30 分钟）-> open-meteo 公共接口 -> 离线兜底。
 * 任何异常都不会向上抛，保证页面始终可用。
 */
export async function fetchWeather(options: { force?: boolean; timeout?: number } = {}): Promise<WeatherNow> {
  const { force = false, timeout = 6000 } = options
  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(ENDPOINT, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('天气接口返回 ' + response.status)
    const payload = (await response.json()) as OpenMeteoResponse
    const data = normalize(payload)
    writeCache(data)
    return data
  } catch {
    return fallbackWeather()
  } finally {
    clearTimeout(timer)
  }
}
