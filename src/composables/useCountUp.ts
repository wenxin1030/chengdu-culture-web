import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 数字滚动动画：进入视口后从 0 递增到目标值。
 * 使用 requestAnimationFrame + easeOutCubic，尊重 prefers-reduced-motion。
 */
export function useCountUp(target: number, duration = 1400) {
  const display = ref(0)
  const el = ref<HTMLElement | null>(null)
  let frame = 0
  let observer: IntersectionObserver | null = null
  let started = false

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  function run() {
    if (started) return
    started = true
    if (prefersReduced) {
      display.value = target
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      display.value = Math.round(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  onMounted(() => {
    const node = el.value
    if (!node || typeof IntersectionObserver === 'undefined') {
      run()
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run()
          observer?.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
  })

  watch(
    () => target,
    (value) => {
      display.value = value
    },
  )

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    observer?.disconnect()
  })

  return { el, display }
}
