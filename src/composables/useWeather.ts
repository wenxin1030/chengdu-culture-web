import { computed, onMounted } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { comfortTip, temperatureText } from '@/utils/weather'

/** 天气组合式封装：组件只需关心展示文案 */
export function useWeather(autoLoad = true) {
  const store = useWeatherStore()

  const temperature = computed(() => (store.weather ? temperatureText(store.weather.temperature) : '--'))
  const text = computed(() => store.weather?.text ?? '加载中')
  const icon = computed(() => store.weather?.icon ?? 'cloud')
  const tip = computed(() =>
    store.weather ? comfortTip(store.weather.temperature, store.weather.code) : '正在获取天气…',
  )
  const updatedAt = computed(() => {
    if (!store.weather) return ''
    const d = new Date(store.weather.updatedAt)
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  })
  const isOnline = computed(() => store.weather?.source === 'online')

  onMounted(() => {
    if (autoLoad) void store.load()
  })

  return { store, temperature, text, icon, tip, updatedAt, isOnline }
}
