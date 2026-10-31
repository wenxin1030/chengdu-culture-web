import { scenicSpots } from '@/data/scenic'
import { foods } from '@/data/food'
import { cultureEvents } from '@/data/culture'
import { guides } from '@/data/guides'
import { cityServices } from '@/data/services'
import { metroLines, trafficRoutes } from '@/data/traffic'
import type { CultureEvent, Food, Guide, ScenicSpot } from '@/types'

/**
 * 模拟后端接口的延迟，让加载态、骨架屏与错误处理在真实网络条件下也能被验证。
 * 生产环境可把这里替换为真实 fetch，页面组件无需改动。
 */
function delay<T>(data: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export const contentApi = {
  getScenicSpots: (): Promise<ScenicSpot[]> => delay([...scenicSpots]),
  getScenicSpot: (id: string): Promise<ScenicSpot | undefined> =>
    delay(scenicSpots.find((s) => s.id === id)),
  getFoods: (): Promise<Food[]> => delay([...foods]),
  getFood: (id: string): Promise<Food | undefined> => delay(foods.find((f) => f.id === id)),
  getCultureEvents: (): Promise<CultureEvent[]> => delay([...cultureEvents]),
  getCultureEvent: (id: string): Promise<CultureEvent | undefined> =>
    delay(cultureEvents.find((c) => c.id === id)),
  getGuides: (): Promise<Guide[]> => delay([...guides]),
  getGuide: (id: string): Promise<Guide | undefined> => delay(guides.find((g) => g.id === id)),
  getServices: () => delay([...cityServices]),
  getTrafficRoutes: () => delay([...trafficRoutes]),
  getMetroLines: () => delay([...metroLines]),
}
