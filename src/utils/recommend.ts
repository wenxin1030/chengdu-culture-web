import { scenicSpots } from '@/data/scenic'
import type { Food, Guide, ScenicSpot } from '@/types'

/**
 * 智能推荐：标签相似度 + 热度 + 季节权重的混合排序。
 * 纯前端实现，无需用户画像，页面加载即可给出“猜你喜欢”。
 */

export interface Scored<T> {
  item: T
  score: number
}

/** 两份标签的重合数量 */
export function overlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setB = new Set(b)
  let n = 0
  for (const item of a) if (setB.has(item)) n += 1
  return n
}

/** 当前季节（按月份划分） */
export function currentSeason(date = new Date()): string {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

/** 景区推荐：标签 + 季节 + 热度 */
export function recommendScenic(current: ScenicSpot | null, limit = 3): ScenicSpot[] {
  const tags = current?.tags ?? []
  const season = current?.bestSeason ?? currentSeason()
  return scenicSpots
    .filter((s) => s.id !== current?.id)
    .map<Scored<ScenicSpot>>((s) => {
      const tagScore = overlap(tags, s.tags) * 10
      const seasonScore = s.bestSeason === season ? 8 : 0
      const heatScore = Math.min(s.heat / 10000, 3)
      return { item: s, score: tagScore + seasonScore + heatScore }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}

/** 美食推荐：同标签 + 同辣度优先，其次评分 */
export function recommendFood(current: Food | null, all: Food[], limit = 3): Food[] {
  if (!current) {
    return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit)
  }
  return all
    .filter((f) => f.id !== current.id)
    .map<Scored<Food>>((f) => {
      const tagScore = overlap(current.tags, f.tags) * 10
      const spicyScore = Math.abs(current.spicy - f.spicy) === 0 ? 6 : 0
      return { item: f, score: tagScore + spicyScore + f.rating }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}

/** 攻略推荐：同标签优先，其次人气 */
export function recommendGuide(current: Guide | null, all: Guide[], limit = 2): Guide[] {
  return all
    .filter((g) => g.id !== current?.id)
    .map<Scored<Guide>>((g) => ({
      item: g,
      score: overlap(current?.tags ?? [], g.tags) * 10 + g.views / 10000,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}
