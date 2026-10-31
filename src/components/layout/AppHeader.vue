<script setup lang="ts">
/**
 * 站点页眉（公共组件）
 * 结构：① 辅助功能区（实时天气 + 无障碍 / 收藏 / 智能助手）
 *       ② 主导航（印章 Logo + 八个栏目 + 全站搜索 + 主题切换）
 *       ③ 移动端抽屉导航
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import WeatherWidget from '@/components/common/WeatherWidget.vue'
import SearchPanel from '@/components/common/SearchPanel.vue'
import { useAppStore } from '@/stores/app'
import { navItems } from '@/router/nav'

const app = useAppStore()
const route = useRoute()
const searchOpen = ref(false)

const today = computed(() => {
  const d = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 星期' + week
})

const currentPath = computed(() => route.path)

// 路由变化时自动关闭移动端抽屉
watch(
  () => route.fullPath,
  () => app.closeNav(),
)

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <a class="skip-link" href="#main">跳到主要内容</a>

  <header class="site-header">
    <!-- ① 辅助功能区 -->
    <div class="utility">
      <div class="container utility-inner">
        <div class="utility-left">
          <WeatherWidget variant="pill" />
          <span class="date">{{ today }}</span>
        </div>
        <div class="utility-right">
          <button
            type="button"
            class="util-link"
            :aria-pressed="app.isHighContrast"
            title="切换高对比度配色"
            @click="app.toggleContrast()"
          >
            <span aria-hidden="true">◐</span> 无障碍
          </button>
          <RouterLink to="/service" class="util-link">
            <span aria-hidden="true">☰</span> 城市服务
          </RouterLink>
          <RouterLink to="/#assistant" class="util-link">
            <span aria-hidden="true">✦</span> 智能助手
          </RouterLink>
          <span class="util-link is-static">收藏 {{ app.favoriteCount }}</span>
        </div>
      </div>
    </div>

    <!-- ② 主导航 -->
    <div class="main-bar">
      <div class="container main-inner">
        <RouterLink to="/" class="brand" aria-label="天府成都 · 锦官城文化宣传网 首页">
          <span class="seal" aria-hidden="true">蓉</span>
          <span class="brand-text">
            <strong>天府成都</strong>
            <small>锦官城文化宣传网</small>
          </span>
        </RouterLink>

        <nav class="nav" aria-label="主导航">
          <ul>
            <li v-for="item in navItems" :key="item.path">
              <RouterLink
                :to="item.path"
                class="nav-link"
                :class="{ 'is-active': item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path) }"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="tools">
          <button type="button" class="tool search" aria-label="打开全站搜索" @click="searchOpen = true">
            <span aria-hidden="true">⌕</span>
            <span class="search-hint">搜索景点 / 美食 / 攻略</span>
            <kbd>/</kbd>
          </button>
          <button
            type="button"
            class="tool icon"
            :aria-label="app.isDark ? '切换到浅色主题' : '切换到深色主题'"
            :title="app.isDark ? '浅色模式' : '深色模式'"
            @click="app.toggleTheme()"
          >
            <span aria-hidden="true">{{ app.isDark ? '☀' : '☾' }}</span>
          </button>
          <button
            type="button"
            class="tool icon hamburger"
            :aria-expanded="app.navOpen"
            aria-controls="mobile-nav"
            aria-label="打开导航菜单"
            @click="app.toggleNav()"
          >
            <span aria-hidden="true">{{ app.navOpen ? '✕' : '☰' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ③ 移动端抽屉 -->
    <Transition name="drawer">
      <nav v-if="app.navOpen" id="mobile-nav" class="mobile-nav" aria-label="移动端导航">
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <RouterLink :to="item.path" class="mobile-link">
              <span class="m-icon" aria-hidden="true">{{ item.icon }}</span>
              <span class="m-text">
                <strong>{{ item.label }}</strong>
                <small>{{ item.desc }}</small>
              </span>
            </RouterLink>
          </li>
        </ul>
        <div class="mobile-foot">
          <button type="button" class="mobile-action" @click="searchOpen = true">全站搜索</button>
          <button type="button" class="mobile-action" @click="scrollTop">回到顶部</button>
        </div>
      </nav>
    </Transition>

    <SearchPanel v-model:open="searchOpen" />
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  /* 用语义 token --bg-page，深浅色主题自动跟随 */
  background: color-mix(in srgb, var(--bg-page) 90%, transparent);
  backdrop-filter: saturate(1.2) blur(14px);
  border-bottom: 1px solid var(--color-border);
}
.utility {
  border-bottom: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.utility-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 40px;
}
.utility-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.date {
  white-space: nowrap;
  letter-spacing: 0.04em;
}
.utility-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.util-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  border: 0;
  background: none;
  padding: 0.2em 0;
  font: inherit;
  color: var(--color-text-muted);
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}
.util-link:hover {
  color: var(--color-brand-700);
}
.util-link.is-static {
  cursor: default;
}
.main-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-height: var(--header-h);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}
.seal {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--color-cinnabar-500);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-cinnabar-500) 35%, transparent);
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.brand-text strong {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  color: var(--color-text-strong);
}
.brand-text small {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--color-text-faint);
}
.nav {
  flex: 1;
  min-width: 0;
}
.nav ul {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  margin: 0;
  padding: 0;
  list-style: none;
  justify-content: center;
}
.nav-link {
  display: inline-block;
  padding: 0.5em 0.7em;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
  transition:
    color var(--dur-sm),
    background var(--dur-sm);
}
.nav-link:hover {
  background: var(--color-brand-50);
  color: var(--color-brand-700);
}
.nav-link.is-active {
  color: var(--color-brand-700);
  font-weight: 600;
  background: var(--color-brand-50);
}
.tools {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.tool {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  border-radius: 999px;
  transition:
    border-color var(--dur-sm),
    color var(--dur-sm);
}
.tool:hover {
  border-color: var(--color-brand-300);
  color: var(--color-brand-700);
}
.tool.search {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.4em 0.5em 0.4em 0.8em;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.search-hint {
  white-space: nowrap;
}
.tool kbd {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  background: var(--color-surface-alt);
  color: var(--color-text-faint);
}
.tool.icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  font-size: 1rem;
}
.hamburger {
  display: none;
}
.mobile-nav {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  max-height: calc(100dvh - var(--header-h));
  overflow-y: auto;
  padding: var(--space-3) var(--space-4) var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}
.mobile-nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
}
.mobile-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0.7em 0.6em;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
}
.mobile-link:hover {
  background: var(--color-brand-50);
}
.m-icon {
  font-size: 1.15rem;
  width: 1.6em;
  text-align: center;
}
.m-text {
  display: flex;
  flex-direction: column;
}
.m-text small {
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
}
.mobile-foot {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.mobile-action {
  flex: 1;
  padding: 0.65em;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text);
  cursor: pointer;
}
.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity var(--dur-sm) var(--ease-out),
    transform var(--dur-sm) var(--ease-out);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (max-width: 1279px) {
  .search-hint {
    display: none;
  }
  .nav-link {
    padding: 0.5em 0.5em;
    font-size: 0.86rem;
  }
}
@media (max-width: 1100px) {
  .nav {
    display: none;
  }
  .hamburger {
    display: grid;
  }
  .brand {
    margin-right: auto;
  }
}
@media (max-width: 767px) {
  .utility-right .util-link:nth-child(2),
  .utility-right .util-link:nth-child(3) {
    display: none;
  }
  .date {
    display: none;
  }
}
</style>
