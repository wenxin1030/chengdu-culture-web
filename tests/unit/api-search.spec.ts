import { describe, expect, it } from 'vitest'
import { buildIndex, hotKeywords, searchAll } from '@/api/search'

describe('api/search 全站搜索', () => {
  it('索引覆盖景区/美食/活动/攻略/服务五类内容', () => {
    const index = buildIndex()
    const types = new Set(index.map((entry) => entry.type))
    expect(types).toEqual(new Set(['景区', '美食', '活动', '攻略', '服务']))
    expect(index.length).toBeGreaterThan(30)
  })

  it('搜索“熊猫”优先返回熊猫基地', () => {
    const results = searchAll('熊猫')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].title).toContain('熊猫')
  })

  it('搜索景区名称可定位到详情路由', () => {
    const results = searchAll('都江堰')
    const hit = results.find((item) => item.title === '都江堰')
    expect(hit).toBeDefined()
    expect(hit?.path).toBe('/scenic/dujiangyan')
  })

  it('空查询返回空数组，干扰词返回空结果', () => {
    expect(searchAll('   ')).toEqual([])
    expect(searchAll('zzzz不存在的词')).toEqual([])
  })

  it('结果按相关度降序排列且数量受 limit 限制', () => {
    const results = searchAll('成都', 5)
    expect(results.length).toBeLessThanOrEqual(5)
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('热门关键词为非空字符串数组', () => {
    expect(hotKeywords.length).toBeGreaterThan(4)
    expect(hotKeywords.every((k) => typeof k === 'string' && k.length > 0)).toBe(true)
  })
})
