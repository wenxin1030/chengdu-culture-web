/** 搜索与文本匹配工具（智能搜索的匹配核心） */

/** 把查询串切成关键词（按空白与标点切分，去重，长度 >= 1） */
export function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[\s,，.。、;；!！?？:：'"“”()（）\-—]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    ),
  )
}

export interface MatchResult {
  score: number
  hits: string[]
}

/**
 * 计算查询与文本的匹配得分。
 * 规则：标题命中权重 3，正文命中权重 1，标签命中权重 2；完全相同的词额外加分。
 */
export function scoreMatch(query: string, fields: { text: string; weight: number }[]): MatchResult {
  const tokens = tokenize(query)
  if (tokens.length === 0) return { score: 0, hits: [] }
  const hits: string[] = []
  let score = 0
  for (const token of tokens) {
    let tokenHit = false
    for (const field of fields) {
      const haystack = field.text.toLowerCase()
      if (!haystack) continue
      const count = countOccurrences(haystack, token)
      if (count > 0) {
        tokenHit = true
        score += count * field.weight
        if (haystack === token) score += field.weight * 2
        continue
      }
      // 词表未覆盖的写法（如“熊猫基地” vs “大熊猫繁育研究基地”）：用二元组做部分召回
      const grams = bigrams(token)
      if (grams.length < 2) continue
      let matched = 0
      for (const gram of grams) if (haystack.includes(gram)) matched += 1
      if (matched > 0) {
        tokenHit = true
        score += matched * field.weight * 0.5
      }
    }
    if (tokenHit) hits.push(token)
  }
  // 全部关键词都命中的结果额外加权，避免长文本靠重复词胜出
  const coverage = hits.length / tokens.length
  score *= 1 + coverage
  return { score: Math.round(score * 100) / 100, hits }
}

/** 统计子串出现次数（大小写不敏感由调用方保证） */
export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0
  let count = 0
  let index = haystack.indexOf(needle)
  while (index !== -1) {
    count += 1
    index = haystack.indexOf(needle, index + needle.length)
  }
  return count
}

/** 把文本中出现的关键词包成 <mark> 片段，返回结构化数据（避免使用 v-html） */
export interface Segment {
  text: string
  mark: boolean
}

export function highlight(text: string, query: string): Segment[] {
  const tokens = tokenize(query).filter((t) => t.length > 0)
  if (tokens.length === 0 || !text) return [{ text, mark: false }]
  const lower = text.toLowerCase()
  const ranges: [number, number][] = []
  for (const token of tokens) {
    let index = lower.indexOf(token)
    while (index !== -1) {
      ranges.push([index, index + token.length])
      index = lower.indexOf(token, index + token.length)
    }
  }
  if (ranges.length === 0) return [{ text, mark: false }]
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = [ranges[0]]
  for (let i = 1; i < ranges.length; i += 1) {
    const last = merged[merged.length - 1]
    if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1])
    else merged.push(ranges[i])
  }
  const segments: Segment[] = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), mark: false })
    segments.push({ text: text.slice(start, end), mark: true })
    cursor = end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), mark: false })
  return segments
}

/**
 * 中文没有空格，长问句用整串字面匹配会全部落空。
 * 这里用「字符二元组」做相似度：把文本切成相邻两字组合，比较交集占比，
 * 对“熊猫基地几点去最好”这类自然语言提问更稳健。
 */
export function bigrams(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '')
  const grams: string[] = []
  for (let i = 0; i < normalized.length - 1; i += 1) grams.push(normalized.slice(i, i + 2))
  return grams
}

/** 二元组 Jaccard 相似度，取值 0~1 */
export function similarity(a: string, b: string): number {
  const setA = new Set(bigrams(a))
  const setB = new Set(bigrams(b))
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const gram of setA) if (setB.has(gram)) intersection += 1
  return intersection / (setA.size + setB.size - intersection)
}