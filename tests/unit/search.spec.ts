import { describe, expect, it } from 'vitest'
import { countOccurrences, highlight, scoreMatch, tokenize } from '@/utils/search'

describe('utils/search', () => {
  it('tokenize 按空白与标点切分并去重', () => {
    expect(tokenize('熊猫基地 火锅')).toEqual(['熊猫基地', '火锅'])
    expect(tokenize('熊猫，熊猫 火锅')).toEqual(['熊猫', '火锅'])
    expect(tokenize('   ')).toEqual([])
  })

  it('countOccurrences 统计子串出现次数', () => {
    expect(countOccurrences('熊猫基地熊猫', '熊猫')).toBe(2)
    expect(countOccurrences('abc', '')).toBe(0)
  })

  it('scoreMatch 标题命中权重高于正文', () => {
    const titleHit = scoreMatch('火锅', [{ text: '成都火锅', weight: 6 }])
    const bodyHit = scoreMatch('火锅', [{ text: '成都火锅', weight: 1 }])
    expect(titleHit.score).toBeGreaterThan(bodyHit.score)
    expect(titleHit.hits).toEqual(['火锅'])
  })

  it('scoreMatch 对全部关键词命中的结果额外加权', () => {
    const full = scoreMatch('熊猫 基地', [
      { text: '熊猫基地', weight: 6 },
      { text: '熊猫基地攻略', weight: 1 },
    ])
    const partial = scoreMatch('熊猫 基地', [{ text: '熊猫', weight: 6 }])
    expect(full.score).toBeGreaterThan(partial.score)
  })

  it('scoreMatch 无命中返回 0 分', () => {
    expect(scoreMatch('火锅', [{ text: '都江堰', weight: 6 }]).score).toBe(0)
    expect(scoreMatch('', [{ text: '都江堰', weight: 6 }]).score).toBe(0)
  })

  it('highlight 返回分段并标记命中区间', () => {
    const segments = highlight('成都火锅真好吃', '火锅')
    expect(segments.map((s) => s.text).join('')).toBe('成都火锅真好吃')
    expect(segments.filter((s) => s.mark).map((s) => s.text)).toEqual(['火锅'])
  })

  it('highlight 合并重叠区间，空查询返回整段', () => {
    const segments = highlight('熊猫基地', '熊猫 基地')
    expect(segments.filter((s) => s.mark).map((s) => s.text)).toEqual(['熊猫基地'])
    expect(highlight('成都', '')).toEqual([{ text: '成都', mark: false }])
  })
})
