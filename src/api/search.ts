import { scenicSpots } from '@/data/scenic'
import { foods } from '@/data/food'
import { cultureEvents } from '@/data/culture'
import { guides } from '@/data/guides'
import { cityServices } from '@/data/services'
import { scoreMatch } from '@/utils/search'
import type { ImgKey } from '@/types'

/** 全站搜索索引条目 */
export interface SearchEntry {
  id: string
  type: '景区' | '美食' | '活动' | '攻略' | '服务'
  title: string
  subtitle: string
  path: string
  img?: ImgKey
  tags: string[]
  heat: number
  /** 参与匹配的附加正文 */
  body: string
}

export interface SearchHit extends SearchEntry {
  score: number
  hits: string[]
}

let index: SearchEntry[] | null = null

/** 构建（并缓存）全站搜索索引 */
export function buildIndex(): SearchEntry[] {
  if (index) return index
  index = [
    ...scenicSpots.map((s) => ({
      id: 'scenic-' + s.id,
      type: '景区' as const,
      title: s.name,
      subtitle: s.summary,
      path: '/scenic/' + s.id,
      img: s.img,
      tags: s.tags,
      heat: s.heat,
      body: [s.intro, s.area, s.level, s.address, s.transport, s.bestSeason, ...s.highlights, ...s.tips].join(' '),
    })),
    ...foods.map((f) => ({
      id: 'food-' + f.id,
      type: '美食' as const,
      title: f.name,
      subtitle: f.summary,
      path: '/food/' + f.id,
      img: f.img,
      tags: f.tags,
      heat: f.rating * 100,
      body: [f.intro, f.price, ...f.districts, ...f.shops].join(' '),
    })),
    ...cultureEvents.map((c) => ({
      id: 'culture-' + c.id,
      type: '活动' as const,
      title: c.name,
      subtitle: c.summary,
      path: '/culture/' + c.id,
      img: c.img,
      tags: c.tags,
      heat: (12 - c.month) * 50,
      body: [c.intro, c.place, c.duration, c.price, c.category, c.season].join(' '),
    })),
    ...guides.map((g) => ({
      id: 'guide-' + g.id,
      type: '攻略' as const,
      title: g.title,
      subtitle: g.subtitle,
      path: '/guides/' + g.id,
      img: g.img,
      tags: g.tags,
      heat: g.views,
      body: [g.excerpt, ...g.sections.map((s) => s.title + ' ' + s.paragraphs.join(' '))].join(' '),
    })),
    ...cityServices.map((s) => ({
      id: 'service-' + s.id,
      type: '服务' as const,
      title: s.name,
      subtitle: s.desc,
      path: '/service#service-' + s.id,
      tags: [s.category],
      heat: 100,
      body: [s.desc, s.category].join(' '),
    })),
  ]
  return index
}

/** 执行全站搜索，返回按相关度排序的结果 */
export function searchAll(query: string, limit = 12): SearchHit[] {
  const q = query.trim()
  if (!q) return []
  const entries = buildIndex()
  const scored: SearchHit[] = []
  for (const entry of entries) {
    const { score, hits } = scoreMatch(q, [
      { text: entry.title, weight: 6 },
      { text: entry.tags.join(' '), weight: 3 },
      { text: entry.subtitle, weight: 2 },
      { text: entry.body, weight: 1 },
      { text: entry.type, weight: 2 },
    ])
    if (score > 0) scored.push({ ...entry, score: score + entry.heat / 100000, hits })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

/** 热门搜索词（首页与空态展示） */
export const hotKeywords = ['熊猫基地', '火锅', '川剧变脸', '都江堰', '三天两夜', '地铁', '灯会', '夜游']
