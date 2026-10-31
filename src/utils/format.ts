/** 通用格式化与工具函数（纯函数，便于单元测试） */

/** 千分位数字，如 20431 -> "20,431" */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return Math.round(value).toLocaleString('en-US')
}

/** 以“万”为单位的紧凑数字，如 20431 -> "2.0万" */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (value < 10000) return formatNumber(value)
  return (value / 10000).toFixed(1) + '万'
}

/** 日期格式化：2026-03-18 -> 2026年3月18日 */
export function formatDate(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
}

/** 毫秒时间戳 -> HH:mm */
export function formatTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '--:--'
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return h + ':' + m
}

/** 预算显示：1600 -> "¥1,600" */
export function formatBudget(value: number): string {
  return '¥' + formatNumber(value)
}

/** 按长度把数组切成若干块 */
export function chunk<T>(list: T[], size: number): T[][] {
  if (size <= 0) return [list.slice()]
  const result: T[][] = []
  for (let i = 0; i < list.length; i += size) result.push(list.slice(i, i + size))
  return result
}

/** 截断文本，超出部分以省略号结尾 */
export function truncate(text: string, max: number): string {
  if (!text) return ''
  return text.length <= max ? text : text.slice(0, max) + '…'
}

/** 抖动函数：在 wait 毫秒内只执行最后一次 */
export function debounce<F extends (...args: never[]) => void>(fn: F, wait = 200) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

/** 节流函数：每 gap 毫秒最多执行一次 */
export function throttle<F extends (...args: never[]) => void>(fn: F, gap = 200) {
  let last = 0
  return (...args: Parameters<F>) => {
    const now = Date.now()
    if (now - last >= gap) {
      last = now
      fn(...args)
    }
  }
}

/** 唯一 id（用于列表 key 与动画延迟索引） */
export function uid(prefix = 'id'): string {
  return prefix + '-' + Math.random().toString(36).slice(2, 8)
}

/** 限制数值区间 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
