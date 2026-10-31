<script setup lang="ts">
/**
 * 首页边栏导航（任务书要求的「边栏导航」）
 * - 左侧竖排 8 个板块快捷入口 + 回到顶部
 * - 滚动时高亮当前所在板块（IntersectionObserver 监听）
 * - 仅在 ≥1280px 显示，小屏由页眉抽屉导航承担
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface SideItem {
  id: string
  label: string
  icon: string
}

const props = defineProps<{ items: SideItem[] }>()

const activeId = ref(props.items[0]?.id ?? '')
const scrolled = ref(false)
let observer: IntersectionObserver | null = null

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: 'smooth' })
}

function onScroll() {
  scrolled.value = window.scrollY > 240
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) activeId.value = visible.target.id
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.4, 0.8] },
  )
  for (const item of props.items) {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <aside class="side-nav" :class="{ 'is-scrolled': scrolled }" aria-label="页面板块导航">
    <ul>
      <li v-for="item in props.items" :key="item.id">
        <button
          type="button"
          class="side-link"
          :class="{ 'is-active': activeId === item.id }"
          :aria-current="activeId === item.id ? 'true' : undefined"
          @click="scrollTo(item.id)"
        >
          <span class="ico" aria-hidden="true">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </button>
      </li>
    </ul>
    <button type="button" class="top" :class="{ 'is-visible': scrolled }" aria-label="回到顶部" @click="scrollTo('top')">
      ↑
    </button>
  </aside>
</template>

<style scoped>
.side-nav {
  position: fixed;
  left: max(0.75rem, calc((100vw - var(--container-wide)) / 2 - 58px));
  top: 50%;
  translate: 0 -50%;
  z-index: var(--z-sticky);
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.35rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
}
.side-nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.2rem;
}
.side-link {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    color var(--dur-sm),
    background var(--dur-sm);
}
.side-link:hover,
.side-link.is-active {
  background: var(--color-brand-50);
  color: var(--color-brand-700);
}
.side-link .label {
  position: absolute;
  left: calc(100% + 8px);
  padding: 0.25em 0.7em;
  border-radius: 6px;
  background: var(--color-ink-900);
  color: var(--color-paper-50);
  font-size: var(--fs-xs);
  white-space: nowrap;
  opacity: 0;
  translate: -4px 0;
  pointer-events: none;
  transition:
    opacity var(--dur-sm),
    translate var(--dur-sm);
}
.side-link:hover .label,
.side-link:focus-visible .label {
  opacity: 1;
  translate: 0 0;
}
.ico {
  font-size: 1rem;
  line-height: 1;
}
.top {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0;
  background: var(--color-brand-600);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-md);
}
.top.is-visible {
  opacity: 1;
  pointer-events: auto;
}
@media (min-width: 1280px) {
  .side-nav {
    display: flex;
  }
}
</style>
