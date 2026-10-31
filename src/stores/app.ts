import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'
export type ContrastMode = 'normal' | 'high'

const THEME_KEY = 'cd-theme'
const CONTRAST_KEY = 'cd-contrast'
const HISTORY_KEY = 'cd-search-history'
const FAVORITE_KEY = 'cd-favorites'

function read(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* 忽略隐私模式下的写入失败 */
  }
}

/**
 * 全局应用状态：主题、无障碍对比度、移动端导航、搜索历史、收藏。
 * 所有持久化都做了 try/catch 兜底，隐私模式下也不会报错。
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    theme: read(THEME_KEY, 'light') as ThemeMode,
    contrast: read(CONTRAST_KEY, 'normal') as ContrastMode,
    navOpen: false,
    searchOpen: false,
    searchKeyword: '',
    searchHistory: [] as string[],
    favorites: [] as string[],
    ready: false,
  }),
  getters: {
    isDark: (state) => state.theme === 'dark',
    isHighContrast: (state) => state.contrast === 'high',
    favoriteCount: (state) => state.favorites.length,
    recentKeywords: (state) => state.searchHistory.slice(0, 6),
  },
  actions: {
    /** 把当前主题写入 <html> 便于 CSS 变量切换 */
    applyTheme() {
      const el = document.documentElement
      el.dataset.theme = this.theme
      el.dataset.contrast = this.contrast
      el.style.colorScheme = this.theme === 'dark' ? 'dark' : 'light'
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      write(THEME_KEY, this.theme)
      this.applyTheme()
    },
    toggleContrast() {
      this.contrast = this.contrast === 'high' ? 'normal' : 'high'
      write(CONTRAST_KEY, this.contrast)
      this.applyTheme()
    },
    openNav() {
      this.navOpen = true
    },
    closeNav() {
      this.navOpen = false
    },
    toggleNav() {
      this.navOpen = !this.navOpen
    },
    openSearch() {
      this.searchOpen = true
    },
    closeSearch() {
      this.searchOpen = false
    },
    setKeyword(value: string) {
      this.searchKeyword = value
    },
    pushSearchHistory(keyword: string) {
      const value = keyword.trim()
      if (!value) return
      this.searchHistory = [value, ...this.searchHistory.filter((k) => k !== value)].slice(0, 10)
      write(HISTORY_KEY, JSON.stringify(this.searchHistory))
    },
    clearSearchHistory() {
      this.searchHistory = []
      write(HISTORY_KEY, JSON.stringify([]))
    },
    toggleFavorite(id: string) {
      this.favorites = this.favorites.includes(id)
        ? this.favorites.filter((x) => x !== id)
        : [id, ...this.favorites]
      write(FAVORITE_KEY, JSON.stringify(this.favorites))
    },
    isFavorite(id: string) {
      return this.favorites.includes(id)
    },
    /** 应用启动时调用：恢复本地状态并同步到 DOM */
    init() {
      try {
        const history = JSON.parse(read(HISTORY_KEY, '[]'))
        if (Array.isArray(history)) this.searchHistory = history.filter((x) => typeof x === 'string')
        const favorites = JSON.parse(read(FAVORITE_KEY, '[]'))
        if (Array.isArray(favorites)) this.favorites = favorites.filter((x) => typeof x === 'string')
      } catch {
        this.searchHistory = []
        this.favorites = []
      }
      this.applyTheme()
      this.ready = true
    },
  },
})
