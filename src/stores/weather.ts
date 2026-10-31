import { defineStore } from 'pinia'
import { fetchWeather, fallbackWeather } from '@/api/weather'
import type { WeatherNow } from '@/types'

/** 实时天气 store：页眉、首页天气卡片、出行建议共用同一份数据 */
export const useWeatherStore = defineStore('weather', {
  state: () => ({
    weather: null as WeatherNow | null,
    loading: false,
    error: '' as string,
    loadedAt: 0,
  }),
  getters: {
    isOnline: (state) => state.weather?.source === 'online',
    summary: (state) => {
      const w = state.weather
      if (!w) return '天气加载中'
      return w.city + ' ' + w.temperature + '° ' + w.text
    },
    /** 未来 3 天是否下雨，用于出行提示 */
    willRain: (state) => (state.weather?.daily ?? []).slice(0, 3).some((d) => d.icon === 'rain' || d.icon === 'storm'),
  },
  actions: {
    async load(force = false) {
      if (this.loading && !force) return
      if (!force && this.weather && Date.now() - this.loadedAt < 10 * 60 * 1000) return
      this.loading = true
      this.error = ''
      try {
        this.weather = await fetchWeather({ force })
        this.loadedAt = Date.now()
      } catch {
        this.weather = fallbackWeather()
        this.error = '实时天气暂不可用，已切换为示例数据'
      } finally {
        this.loading = false
      }
    },
    async refresh() {
      await this.load(true)
    },
  },
})
