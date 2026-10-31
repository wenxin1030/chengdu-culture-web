import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 滚动进入视口时添加 is-visible 类，配合 CSS 的 fade-up 动画。
 * 同时兼容不支持 IntersectionObserver 的环境（直接可见）。
 */
export function useScrollReveal(options: { threshold?: number; once?: boolean } = {}) {
  const { threshold = 0.15, once = true } = options
  const target = ref<HTMLElement | null>(null)
  const visible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const el = target.value
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      visible.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.value = true
            if (once) observer?.disconnect()
          } else if (!once) {
            visible.value = false
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { target, visible }
}
