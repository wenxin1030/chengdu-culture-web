import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('stores/app 全局状态', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-contrast')
  })

  it('toggleTheme 切换主题并写入 DOM', () => {
    const app = useAppStore()
    expect(app.theme).toBe('light')
    app.toggleTheme()
    expect(app.theme).toBe('dark')
    expect(app.isDark).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('cd-theme')).toBe('dark')
  })

  it('toggleContrast 切换高对比度', () => {
    const app = useAppStore()
    app.toggleContrast()
    expect(app.isHighContrast).toBe(true)
    expect(document.documentElement.dataset.contrast).toBe('high')
  })

  it('pushSearchHistory 去重并置顶，最多保留 10 条', () => {
    const app = useAppStore()
    app.pushSearchHistory('火锅')
    app.pushSearchHistory('熊猫')
    app.pushSearchHistory('火锅')
    expect(app.searchHistory[0]).toBe('火锅')
    expect(app.searchHistory).toHaveLength(2)
    for (let i = 0; i < 12; i += 1) app.pushSearchHistory('k' + i)
    expect(app.searchHistory.length).toBe(10)
    app.clearSearchHistory()
    expect(app.searchHistory).toEqual([])
  })

  it('toggleFavorite 添加与移除收藏', () => {
    const app = useAppStore()
    app.toggleFavorite('scenic-panda')
    expect(app.isFavorite('scenic-panda')).toBe(true)
    expect(app.favoriteCount).toBe(1)
    app.toggleFavorite('scenic-panda')
    expect(app.isFavorite('scenic-panda')).toBe(false)
    expect(app.favoriteCount).toBe(0)
  })

  it('init 从 localStorage 恢复主题与收藏', () => {
    localStorage.setItem('cd-theme', 'dark')
    localStorage.setItem('cd-favorites', JSON.stringify(['scenic-jinli']))
    const app = useAppStore()
    app.init()
    expect(app.theme).toBe('dark')
    expect(app.favorites).toContain('scenic-jinli')
    expect(app.ready).toBe(true)
  })
})
