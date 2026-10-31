<script setup lang="ts">
/** 攻略详情页：作者信息、分段路线、收藏与相关攻略 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import GuideCard from '@/components/cards/GuideCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { getGuideById, guides } from '@/data/guides'
import { formatBudget, formatCompact, formatDate } from '@/utils/format'
import { recommendGuide } from '@/utils/recommend'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const app = useAppStore()
const guide = computed(() => getGuideById(String(route.params.id)))
const related = computed(() => (guide.value ? recommendGuide(guide.value, guides, 3) : []))
const favoriteId = computed(() => 'guide-' + (guide.value?.id ?? ''))

useSeo({
  title: () => guide.value?.title ?? '攻略详情',
  description: () => guide.value?.subtitle ?? '成都游记攻略',
  keywords: () => guide.value?.tags.join(',') ?? '成都攻略',
})
</script>

<template>
  <div v-if="guide" class="detail">
    <header class="hero">
      <div class="container">
        <nav class="crumbs" aria-label="面包屑">
          <RouterLink to="/">首页</RouterLink><span aria-hidden="true">/</span>
          <RouterLink to="/guides">游记攻略</RouterLink><span aria-hidden="true">/</span>
          <span aria-current="page">{{ guide.title }}</span>
        </nav>
        <div class="hero-grid">
          <div class="copy">
            <ul class="tags">
              <li v-for="tag in guide.tags" :key="tag">
                <TagPill tone="brand">{{ tag }}</TagPill>
              </li>
            </ul>
            <h1>{{ guide.title }}</h1>
            <p class="sub">{{ guide.subtitle }}</p>
            <div class="author">
              <span class="avatar" aria-hidden="true">{{ guide.avatar }}</span>
              <div>
                <strong>{{ guide.author }}</strong>
                <small>{{ formatDate(guide.date) }} · {{ guide.season }}</small>
              </div>
              <button
                type="button"
                class="fav"
                :class="{ 'is-on': app.isFavorite(favoriteId) }"
                :aria-pressed="app.isFavorite(favoriteId)"
                @click="app.toggleFavorite(favoriteId)"
              >
                {{ app.isFavorite(favoriteId) ? '★ 已收藏' : '☆ 收藏' }}
              </button>
            </div>
          </div>
          <div class="cover">
            <SmartImage :src="images[guide.img]" :alt="guide.title" ratio="4 / 3" :eager="true" />
          </div>
        </div>
      </div>
    </header>

    <div class="container layout">
      <article class="content">
        <p class="excerpt">{{ guide.excerpt }}</p>

        <RevealSection v-for="(section, index) in guide.sections" :key="section.title" class="section-block">
          <h2>
            <span class="num" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            {{ section.title }}
          </h2>
          <p v-for="(paragraph, i) in section.paragraphs" :key="i">{{ paragraph }}</p>
        </RevealSection>
      </article>

      <aside class="side">
        <div class="fact-card">
          <h2>行程速览</h2>
          <dl>
            <div>
              <dt>天数</dt>
              <dd>{{ guide.days }} 天</dd>
            </div>
            <div>
              <dt>人均预算</dt>
              <dd>{{ formatBudget(guide.budget) }}</dd>
            </div>
            <div>
              <dt>适宜季节</dt>
              <dd>{{ guide.season }}</dd>
            </div>
            <div>
              <dt>作者</dt>
              <dd>{{ guide.author }}</dd>
            </div>
          </dl>
          <p class="social">
            <span aria-hidden="true">♥</span> {{ formatCompact(guide.likes) }} 赞同 ·
            <span aria-hidden="true">👁</span> {{ formatCompact(guide.views) }} 阅读
          </p>
          <RouterLink to="/traffic" class="link">交通换乘指南 →</RouterLink>
        </div>
        <div class="cta">
          <p>攻略看完了，还有问题？</p>
          <RouterLink to="/service" class="cta-link">城市服务入口</RouterLink>
        </div>
      </aside>
    </div>

    <RevealSection v-if="related.length" class="container related">
      <SectionHeading kicker="MORE GUIDES" title="再看几篇" desc="同类主题的其他路线，可以组合出自己的行程。" />
      <div class="grid-3">
        <GuideCard v-for="item in related" :key="item.id" :guide="item" />
      </div>
    </RevealSection>

    <div class="container back">
      <RouterLink to="/guides" class="back-link">← 返回全部攻略</RouterLink>
    </div>
  </div>

  <div v-else class="container missing">
    <EmptyState title="攻略不存在" desc="换个标题看看其他路线吧。">
      <RouterLink to="/guides" class="back-link">返回游记攻略</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.hero {
  padding: var(--space-6) 0 var(--space-7);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-brand-50) 70%, transparent), transparent);
  border-bottom: 1px solid var(--color-border);
}
.crumbs {
  display: flex;
  gap: 0.4em;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  margin-bottom: var(--space-4);
}
.crumbs a {
  color: inherit;
  text-decoration: none;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-6);
  align-items: center;
}
.tags {
  display: flex;
  gap: 0.35rem;
  margin: 0 0 var(--space-3);
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
}
h1 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: clamp(1.6rem, 1.2rem + 2vw, 2.5rem);
  line-height: 1.3;
  color: var(--color-text-strong);
}
.sub {
  margin: 0 0 var(--space-4);
  color: var(--color-text-muted);
  line-height: 1.9;
}
.author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-brand-100);
  color: var(--color-brand-800);
  font-family: var(--font-serif);
  font-weight: 700;
}
.author strong {
  display: block;
  font-size: var(--fs-sm);
  color: var(--color-text-strong);
}
.author small {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.fav {
  margin-left: auto;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  padding: 0.35em 0.9em;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  cursor: pointer;
}
.fav.is-on {
  border-color: var(--color-gold-500);
  color: var(--color-gold-700);
  background: color-mix(in srgb, var(--color-gold-500) 10%, transparent);
}
.cover {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.layout {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-7);
  padding-top: var(--space-6);
}
.content {
  min-width: 0;
}
.excerpt {
  margin: 0 0 var(--space-5);
  padding: var(--space-4) var(--space-5);
  border-left: 3px solid var(--color-brand-500);
  background: var(--color-surface-alt);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: var(--fs-md);
  line-height: 1.95;
  color: var(--color-text);
}
.section-block {
  margin-bottom: var(--space-6);
}
.section-block h2 {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: 1.25rem;
  color: var(--color-text-strong);
}
.num {
  font-size: var(--fs-xs);
  color: var(--color-cinnabar-500);
}
.section-block p {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-md);
  line-height: 2.05;
  color: var(--color-text-muted);
}
.side {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: sticky;
  top: 96px;
  align-self: start;
}
.fact-card {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.fact-card h2 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-serif);
  font-size: 1.05rem;
}
.fact-card dl {
  margin: 0;
  display: grid;
  gap: var(--space-3);
}
.fact-card dt {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.fact-card dd {
  margin: 0.15em 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text);
}
.social {
  margin: var(--space-4) 0 0;
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-border);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.link {
  display: inline-block;
  margin-top: var(--space-3);
  font-size: var(--fs-sm);
  color: var(--color-brand-600);
  text-decoration: none;
}
.cta {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-brand-50) 80%, transparent);
  border: 1px dashed var(--color-brand-300);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.cta p {
  margin: 0 0 var(--space-2);
}
.cta-link {
  color: var(--color-brand-700);
  text-decoration: none;
}
.related {
  padding-top: var(--space-8);
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.back {
  padding: var(--space-5) var(--space-5) var(--space-8);
  border-top: 1px dashed var(--color-border);
  margin-top: var(--space-5);
}
.back-link {
  color: var(--color-brand-600);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.missing {
  padding: var(--space-9) var(--space-5);
}
@media (max-width: 1023px) {
  .hero-grid,
  .layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 767px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
