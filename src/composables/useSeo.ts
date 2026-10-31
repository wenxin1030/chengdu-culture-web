import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { applySeo } from '@/utils/seo'

interface SeoInput {
  title: () => string
  description?: () => string
  keywords?: () => string
}

/**
 * 页面级 SEO：标题与描述随路由变化自动更新。
 * 传入 getter 以便依赖响应式数据（例如详情页的景区名）。
 */
export function useSeo(input: SeoInput) {
  const route = useRoute()
  watchEffect(() => {
    applySeo({
      title: input.title(),
      description: input.description?.(),
      keywords: input.keywords?.(),
      path: route.fullPath,
    })
  })
}
