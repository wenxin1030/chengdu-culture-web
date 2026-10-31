import { describe, expect, it } from 'vitest'
import { currentSeason, overlap, recommendFood, recommendGuide, recommendScenic } from '@/utils/recommend'
import { scenicSpots } from '@/data/scenic'
import { foods } from '@/data/food'
import { guides } from '@/data/guides'

describe('utils/recommend', () => {
  it('overlap 计算标签重合数量', () => {
    expect(overlap(['a', 'b'], ['b', 'c'])).toBe(1)
    expect(overlap([], ['a'])).toBe(0)
  })

  it('currentSeason 按月份划分季节', () => {
    expect(currentSeason(new Date('2026-04-01'))).toBe('春季')
    expect(currentSeason(new Date('2026-07-01'))).toBe('夏季')
    expect(currentSeason(new Date('2026-10-01'))).toBe('秋季')
    expect(currentSeason(new Date('2026-01-01'))).toBe('冬季')
  })

  it('recommendScenic 排除当前景区并返回指定条数', () => {
    const current = scenicSpots[0]
    const result = recommendScenic(current, 3)
    expect(result).toHaveLength(3)
    expect(result.some((s) => s.id === current.id)).toBe(false)
  })

  it('recommendFood 优先同辣度与同标签', () => {
    const current = foods[0]
    const result = recommendFood(current, foods, 2)
    expect(result).toHaveLength(2)
    expect(result.some((f) => f.id === current.id)).toBe(false)
  })

  it('recommendGuide 在无当前对象时按热度返回', () => {
    const result = recommendGuide(null, guides, 2)
    expect(result).toHaveLength(2)
    expect(result[0].views).toBeGreaterThanOrEqual(result[1].views)
  })
})
