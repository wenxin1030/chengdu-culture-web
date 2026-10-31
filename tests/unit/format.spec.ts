import { describe, expect, it } from 'vitest'
import {
  chunk,
  clamp,
  formatBudget,
  formatCompact,
  formatDate,
  formatNumber,
  truncate,
} from '@/utils/format'

describe('utils/format', () => {
  it('formatNumber 添加千分位', () => {
    expect(formatNumber(20431)).toBe('20,431')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(Number.NaN)).toBe('0')
  })

  it('formatCompact 在万级切换单位', () => {
    expect(formatCompact(9999)).toBe('9,999')
    expect(formatCompact(20431)).toBe('2.0万')
    expect(formatCompact(150000)).toBe('15.0万')
  })

  it('formatDate 输出中文日期，非法输入原样返回', () => {
    expect(formatDate('2026-03-18')).toBe('2026年3月18日')
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('formatBudget 输出人民币前缀', () => {
    expect(formatBudget(1600)).toBe('¥1,600')
  })

  it('chunk 按尺寸切分数组', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2], 0)).toEqual([[1, 2]])
  })

  it('truncate 超长时截断并补省略号', () => {
    expect(truncate('成都', 5)).toBe('成都')
    expect(truncate('天府成都文化宣传网', 4)).toBe('天府成都…')
    expect(truncate('', 4)).toBe('')
  })

  it('clamp 限制区间', () => {
    expect(clamp(15, 0, 10)).toBe(10)
    expect(clamp(-3, 0, 10)).toBe(0)
    expect(clamp(5, 0, 10)).toBe(5)
  })
})
