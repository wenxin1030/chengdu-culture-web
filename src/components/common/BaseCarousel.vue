<script setup lang="ts">
/**
 * 轮播组件（公共组件之一）
 * - 自动播放 6s，鼠标悬停 / 键盘聚焦 / 页面隐藏时暂停
 * - 支持左右按钮、指示点、键盘方向键与自定义插槽内容
 * - 遵循 prefers-reduced-motion：关闭自动播放与位移动画
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface Slide {
  id: string
  img: string
  alt: string
  kicker?: string
  title: string
  subtitle?: string
  to?: string
  cta?: string
}

const props = withDefaults(
  defineProps<{
    slides: Slide[]
    interval?: number
    autoplay?: boolean
    height?: string
  }>(),
  { interval: 6000, autoplay: true, height: 'clamp(420px, 62vh, 620px)' },
)

const active = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const reduced =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const canAutoplay = computed(() => props.autoplay && !reduced && props.slides.length > 1)

function go(index: number) {
  const total = props.slides.length
  if (total === 0) return
  active.value = (index + total) % total
}
function next() {
  go(active.value + 1)
}
function prev() {
  go(active.value - 1)
}

function start() {
  stop()
  if (!canAutoplay.value) return
  timer = setInterval(() => {
    if (!paused.value) next()
  }, props.interval)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') next()
  if (event.key === 'ArrowLeft') prev()
}
function onVisibility() {
  paused.value = document.hidden
}

onMounted(() => {
  start()
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  stop()
  document.removeEventListener('visibilitychange', onVisibility)
})
watch(() => props.slides.length, start)

defineExpose({ next, prev, go })
</script>

<template>
  <section
    class="carousel"
    :style="{ height: props.height }"
    role="group"
    aria-roledescription="轮播"
    aria-label="成都城市风貌"
    tabindex="0"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
    @keydown="onKeydown"
  >
    <div class="track">
      <div
        v-for="(slide, index) in props.slides"
        :key="slide.id"
        class="slide"
        :class="{ 'is-active': index === active }"
        role="group"
        aria-roledescription="幻灯片"
        :aria-label="index + 1 + ' / ' + props.slides.length"
        :aria-hidden="index !== active"
      >
        <img
          class="bg"
          :src="slide.img"
          :alt="slide.alt"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          decoding="async"
        />
        <div class="shade" aria-hidden="true"></div>
        <div class="container caption">
          <p v-if="slide.kicker" class="kicker">{{ slide.kicker }}</p>
          <h1 class="title">{{ slide.title }}</h1>
          <p v-if="slide.subtitle" class="subtitle">{{ slide.subtitle }}</p>
          <RouterLink v-if="slide.to" :to="slide.to" class="cta">
            {{ slide.cta || '了解更多' }}<span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <button v-if="props.slides.length > 1" class="nav prev" type="button" aria-label="上一张" @click="prev">
      <span aria-hidden="true">‹</span>
    </button>
    <button v-if="props.slides.length > 1" class="nav next" type="button" aria-label="下一张" @click="next">
      <span aria-hidden="true">›</span>
    </button>

    <div v-if="props.slides.length > 1" class="dots" role="tablist" aria-label="选择幻灯片">
      <button
        v-for="(slide, index) in props.slides"
        :key="'dot-' + slide.id"
        type="button"
        role="tab"
        :aria-selected="index === active"
        :aria-label="'第 ' + (index + 1) + ' 张：' + slide.title"
        class="dot"
        :class="{ 'is-active': index === active }"
        @click="go(index)"
      />
    </div>
  </section>
</template>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
  background: var(--color-ink-900);
  outline: none;
}
.carousel:focus-visible {
  box-shadow: inset 0 0 0 3px var(--color-focus);
}
.track {
  position: absolute;
  inset: 0;
}
.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 700ms var(--ease-out),
    visibility 700ms;
}
.slide.is-active {
  opacity: 1;
  visibility: visible;
}
.bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  transition: transform 8s linear;
}
.slide.is-active .bg {
  transform: scale(1.08);
}
.shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(100deg, rgba(10, 26, 22, 0.78) 0%, rgba(10, 26, 22, 0.4) 46%, rgba(10, 26, 22, 0.05) 78%),
    linear-gradient(to top, rgba(10, 26, 22, 0.6), transparent 45%);
}
.caption {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--space-5);
  color: #f7f4ec;
}
.kicker {
  margin: 0;
  font-size: var(--fs-sm);
  letter-spacing: 0.3em;
  color: var(--color-gold-300);
}
.title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 1.2rem + 3.4vw, 3.6rem);
  line-height: 1.2;
  letter-spacing: 0.04em;
  /* 标题用 \n 手动断行，避免中文在词中间折行 */
  white-space: pre-line;
  max-width: 14em;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
}
.subtitle {
  margin: 0;
  max-width: 44ch;
  font-size: var(--fs-lg);
  line-height: 1.8;
  color: rgba(247, 244, 236, 0.86);
}
.cta {
  align-self: flex-start;
  margin-top: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.7em 1.5em;
  border-radius: 999px;
  background: var(--color-paper-50);
  color: var(--color-brand-800);
  font-weight: 600;
  text-decoration: none;
  transition:
    transform var(--dur-sm) var(--ease-out),
    background var(--dur-sm);
}
.cta:hover {
  transform: translateX(3px);
  background: var(--color-gold-300);
}
.nav {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(247, 244, 236, 0.4);
  background: rgba(12, 32, 27, 0.35);
  color: #f7f4ec;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background var(--dur-sm);
}
.nav:hover {
  background: rgba(12, 32, 27, 0.7);
}
.prev {
  left: var(--space-4);
}
.next {
  right: var(--space-4);
}
.dots {
  position: absolute;
  left: 50%;
  bottom: var(--space-5);
  translate: -50% 0;
  display: flex;
  gap: 0.5rem;
}
.dot {
  width: 28px;
  height: 3px;
  border: 0;
  padding: 0;
  border-radius: 999px;
  background: rgba(247, 244, 236, 0.35);
  cursor: pointer;
  transition:
    width var(--dur-md),
    background var(--dur-md);
}
.dot.is-active {
  width: 52px;
  background: var(--color-gold-300);
}
@media (max-width: 767px) {
  .nav {
    display: none;
  }
  .caption {
    padding-inline: var(--space-4);
  }
}
@media (prefers-reduced-motion: reduce) {
  .bg,
  .slide.is-active .bg {
    transform: none;
    transition: none;
  }
}
</style>
