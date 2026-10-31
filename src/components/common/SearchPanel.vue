<script setup lang="ts">
/**
 * 全站智能搜索面板（命令面板式）
 * - 输入即搜：标题 / 标签 / 正文加权匹配，结果按类型分组
 * - 支持搜索历史、热词推荐、键盘上下选择与 Esc 关闭
 * - 使用 Teleport 渲染到 body，避免被页眉的层叠上下文裁剪
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { hotKeywords } from '@/api/search'
import { useGlobalSearch } from '@/composables/useGlobalSearch'
import { useAppStore } from '@/stores/app'
import { images } from '@/assets/images'
import type { ImgKey } from '@/types'

const open = defineModel<boolean>('open', { default: false })
const router = useRouter()
const app = useAppStore()
const { keyword, grouped, results, searching, run } = useGlobalSearch()

const inputRef = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const flat = computed(() => results.value)
const showEmpty = computed(() => keyword.value.trim().length > 0 && !searching.value && flat.value.length === 0)

watch(open, async (value) => {
  if (value) {
    await nextTick()
    inputRef.value?.focus()
    activeIndex.value = 0
  } else {
    keyword.value = ''
    run('')
  }
})

watch(results, () => {
  activeIndex.value = 0
})

function close() {
  open.value = false
}

function go(path: string) {
  close()
  void router.push(path)
}

function submit() {
  const q = keyword.value.trim()
  if (!q) return
  app.pushSearchHistory(q)
  if (flat.value.length > 0) go(flat.value[0].path)
  else go('/search?q=' + encodeURIComponent(q))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (flat.value.length === 0) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % flat.value.length
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + flat.value.length) % flat.value.length
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const hit = flat.value[activeIndex.value]
    if (hit) go(hit.path)
    else submit()
  }
}

function globalHotkey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
  if (event.key === '/' && !typing) {
    event.preventDefault()
    open.value = true
  }
}

function preview(key?: ImgKey): string | undefined {
  return key ? images[key] : undefined
}

onMounted(() => document.addEventListener('keydown', globalHotkey))
onBeforeUnmount(() => document.removeEventListener('keydown', globalHotkey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="search-layer" role="dialog" aria-modal="true" aria-label="全站搜索" @keydown="onKeydown">
        <div class="backdrop" @click="close"></div>
        <div class="panel">
          <div class="field">
            <span class="icon" aria-hidden="true">⌕</span>
            <input
              ref="inputRef"
              v-model="keyword"
              type="search"
              class="input"
              placeholder="搜索景区、美食、活动、攻略或服务…"
              autocomplete="off"
              aria-label="搜索关键词"
              @keydown.enter.prevent="submit"
            />
            <button type="button" class="esc" @click="close">Esc</button>
          </div>

          <div class="body">
            <p v-if="searching" class="hint">正在检索…</p>

            <template v-else-if="keyword.trim()">
              <template v-if="grouped.length > 0">
                <section v-for="group in grouped" :key="group.type" class="group">
                  <h3 class="group-title">{{ group.type }}<span>{{ group.items.length }}</span></h3>
                  <ul>
                    <li v-for="hit in group.items" :key="hit.id">
                      <button
                        type="button"
                        class="result"
                        :class="{ 'is-active': flat.findIndex((f) => f.id === hit.id) === activeIndex }"
                        @click="go(hit.path)"
                      >
                        <img v-if="preview(hit.img)" :src="preview(hit.img)" alt="" class="thumb" loading="lazy" />
                        <span v-else class="thumb placeholder" aria-hidden="true">◈</span>
                        <span class="text">
                          <strong>{{ hit.title }}</strong>
                          <small>{{ hit.subtitle }}</small>
                        </span>
                        <span class="type">{{ hit.type }}</span>
                      </button>
                    </li>
                  </ul>
                </section>
              </template>
              <div v-else-if="showEmpty" class="empty">
                <p>没有找到与「{{ keyword }}」相关的内容。</p>
                <button type="button" class="link" @click="go('/search?q=' + encodeURIComponent(keyword))">
                  查看完整搜索结果 →
                </button>
              </div>
            </template>

            <template v-else>
              <section v-if="app.recentKeywords.length" class="block">
                <div class="block-head">
                  <h3>最近搜索</h3>
                  <button type="button" class="link" @click="app.clearSearchHistory()">清空</button>
                </div>
                <div class="chips">
                  <button v-for="k in app.recentKeywords" :key="k" type="button" class="chip" @click="keyword = k">
                    {{ k }}
                  </button>
                </div>
              </section>
              <section class="block">
                <h3>热门搜索</h3>
                <div class="chips">
                  <button v-for="k in hotKeywords" :key="k" type="button" class="chip" @click="keyword = k">
                    {{ k }}
                  </button>
                </div>
              </section>
            </template>
          </div>

          <footer class="foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-layer {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(1rem, 8vh, 6rem) 1rem 2rem;
}
.backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-ink-900) 55%, transparent);
  backdrop-filter: blur(4px);
}
.panel {
  position: relative;
  width: min(720px, 100%);
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}
.field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.icon {
  font-size: 1.2rem;
  color: var(--color-brand-600);
}
.input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--color-text-strong);
  font-size: var(--fs-lg);
  font-family: inherit;
}
.input::placeholder {
  color: var(--color-text-faint);
}
.esc {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  padding: 0.2em 0.5em;
  cursor: pointer;
}
.body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3) var(--space-2);
}
.hint {
  padding: var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
}
.group + .group {
  margin-top: var(--space-3);
}
.group-title {
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin: 0;
  padding: 0 var(--space-3) var(--space-2);
  font-size: var(--fs-xs);
  letter-spacing: 0.16em;
  color: var(--color-text-faint);
  text-transform: uppercase;
}
.group-title span {
  padding: 0 0.4em;
  border-radius: 999px;
  background: var(--color-surface-alt);
}
.group ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.result {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.result:hover,
.result.is-active {
  background: var(--color-brand-50);
}
.thumb {
  width: 52px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.thumb.placeholder {
  display: grid;
  place-items: center;
  background: var(--color-surface-alt);
  color: var(--color-text-faint);
}
.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.text strong {
  font-weight: 600;
  color: var(--color-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text small {
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.type {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.05em 0.6em;
}
.block {
  padding: var(--space-2) var(--space-3) var(--space-4);
}
.block h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  font-weight: 600;
}
.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.35em 0.85em;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.chip:hover {
  border-color: var(--color-brand-300);
  color: var(--color-brand-700);
}
.empty {
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
}
.link {
  border: 0;
  background: none;
  color: var(--color-brand-600);
  cursor: pointer;
  font-size: var(--fs-sm);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.foot {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
kbd {
  font-family: var(--font-mono);
  padding: 0 0.3em;
  border-radius: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-sm) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 767px) {
  .panel {
    max-height: 86vh;
  }
  .foot {
    display: none;
  }
}
</style>
