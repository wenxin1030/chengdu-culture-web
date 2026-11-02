/** 页面级 SEO：标题、描述与分享信息（SPA 动态更新 head） */

interface SeoOptions {
  title: string
  description?: string
  keywords?: string
  path?: string
}

const SITE_NAME = '天府成都 · 锦官城文化宣传网'
const DEFAULT_DESC =
  '天府成都文化宣传网站：城市介绍、文化活动、经典景区、游记攻略、特色美食与交通路线，带你在墨韵山水间读懂成都。'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>('meta[' + attr + '="' + key + '"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function applySeo(options: SeoOptions): void {
  // 传入完整站名时不再重复拼接后缀（首页即用站名作标题）
  const raw = (options.title || '').trim()
  const title = !raw ? SITE_NAME : raw.includes(SITE_NAME) ? raw : raw + ' · ' + SITE_NAME
  const description = options.description || DEFAULT_DESC
  document.title = title
  upsertMeta('name', 'description', description)
  if (options.keywords) upsertMeta('name', 'keywords', options.keywords)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  if (options.path) {
    const url = window.location.origin + options.path
    upsertMeta('property', 'og:url', url)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }
}
