<script setup lang="ts">
/** 景区详情页：基本信息、看点、实用提示与智能推荐 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TagPill from '@/components/common/TagPill.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import ScenicCard from '@/components/cards/ScenicCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { getScenicById, scenicSpots } from '@/data/scenic'
import { formatCompact } from '@/utils/format'
import { recommendScenic } from '@/utils/recommend'

const route = useRoute()
const spot = computed(() => getScenicById(String(route.params.id)))
const related = computed(() => (spot.value ? recommendScenic(spot.value, 3) : []))

useSeo({
  title: () => spot.value?.name ?? '景区详情',
  description: () => spot.value?.summary ?? '成都经典景区详情',
  keywords: () => spot.value?.tags.join(',') ?? '成都景区',
})

const facts = computed(() => {
  const s = spot.value
  if (!s) return []
  return [
    { label: '门票', value: s.ticket },
    { label: '开放时间', value: s.openTime },
    { label: '建议时长', value: s.duration },
    { label: '最佳季节', value: s.bestSeason },
    { label: '地址', value: s.address },
    { label: '交通', value: s.transport },
  ]
})
</script>

<template>
  <div v-if="spot" class="detail">
    <header class="hero">
      <img class="hero-img" :src="images[spot.img]" :alt="spot.name + ' 风光'" fetchpriority="high" decoding="async" />
      <div class="hero-mask" aria-hidden="true"></div>
      <div class="container hero-inner">
        <nav class="crumbs" aria-label="面包屑">
          <ol>
            <li><RouterLink to="/">首页</RouterLink><span class="sep">/</span></li>
            <li><RouterLink to="/scenic">经典景区</RouterLink><span class="sep">/</span></li>
            <li><span aria-current="page">{{ spot.name }}</span></li>
          </ol>
        </nav>
        <div class="hero-title">
          <div>
            <p class="en">{{ spot.enName }}</p>
            <h1>{{ spot.name }}</h1>
            <p class="sub">{{ spot.summary }}</p>
          </div>
          <div class="hero-side">
            <span class="level">{{ spot.level }} 景区</span>
            <RatingStars :value="spot.rating" />
            <span class="heat">{{ formatCompact(spot.heat * 100) }} 人关注</span>
          </div>
        </div>
      </div>
    </header>

    <div class="container body">
      <div class="main">
        <RevealSection>
          <h2 class="h2">景区介绍</h2>
          <p class="intro">{{ spot.intro }}</p>
          <ul class="tags">
            <li v-for="tag in spot.tags" :key="tag">
              <TagPill tone="brand">{{ tag }}</TagPill>
            </li>
          </ul>
        </RevealSection>

        <RevealSection>
          <h2 class="h2">核心看点</h2>
          <ul class="highlights">
            <li v-for="(item, i) in spot.highlights" :key="item">
              <span class="num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </RevealSection>

        <RevealSection>
          <h2 class="h2">游玩提示</h2>
          <ul class="tips">
            <li v-for="tip in spot.tips" :key="tip">{{ tip }}</li>
          </ul>
        </RevealSection>
      </div>

      <aside class="side">
        <div class="fact-card">
          <h2>实用信息</h2>
          <dl>
            <div v-for="fact in facts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <RouterLink to="/traffic" class="link">查看交通换乘 →</RouterLink>
        </div>
        <div class="side-note">
          <p>需要安排行程？让「锦官小助手」帮你拼一条路线。</p>
          <button type="button" class="ask" aria-label="打开智能问答助手">点击右下角「问成都」</button>
        </div>
      </aside>
    </div>

    <RevealSection class="container related">
      <SectionHeading kicker="YOU MAY ALSO LIKE" title="猜你也想去" desc="根据标签相似度、季节与热度为你推荐。" />
      <div class="grid-3">
        <ScenicCard v-for="item in related" :key="item.id" :scenic="item" />
      </div>
    </RevealSection>

    <div class="container back">
      <RouterLink to="/scenic" class="back-link">← 返回全部景区</RouterLink>
      <RouterLink to="/guides" class="back-link">看看游记攻略 →</RouterLink>
    </div>
  </div>

  <div v-else class="container missing">
    <EmptyState title="没有找到这个景区" desc="它可能已更名或被移除，去列表页看看其他景点吧。">
      <RouterLink to="/scenic" class="back-link">返回景区列表</RouterLink>
    </EmptyState>
    <p class="all">当前收录：{{ scenicSpots.map((s) => s.name).join('、') }}</p>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: clamp(360px, 34vw, 520px);
  display: flex;
  align-items: flex-end;
  background: var(--color-ink-900);
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
}
.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, rgba(9, 26, 22, 0.86), rgba(9, 26, 22, 0.35) 70%, rgba(9, 26, 22, 0.15));
}
.hero-inner {
  position: relative;
  padding: clamp(2rem, 5vw, 4rem) var(--space-5) clamp(2rem, 4vw, 3rem);
  color: #f7f4ec;
}
.crumbs ol {
  display: flex;
  gap: 0.4em;
  margin: 0 0 var(--space-4);
  padding: 0;
  list-style: none;
  font-size: var(--fs-xs);
  color: rgba(247, 244, 236, 0.7);
}
.crumbs a {
  color: inherit;
  text-decoration: none;
}
.sep {
  margin-left: 0.4em;
  opacity: 0.5;
}
.hero-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
}
.en {
  margin: 0 0 0.3em;
  font-size: var(--fs-xs);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-gold-300);
}
h1 {
  margin: 0 0 var(--space-2);
  font-family: var(--font-serif);
  font-size: clamp(2rem, 1.4rem + 2.6vw, 3.2rem);
  letter-spacing: 0.04em;
}
.sub {
  margin: 0;
  max-width: 52ch;
  color: rgba(247, 244, 236, 0.85);
  line-height: 1.85;
}
.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: var(--fs-sm);
  color: rgba(247, 244, 236, 0.95);
  /* 主视觉亮度不均，加投影保证小字号可读 */
  text-shadow: 0 1px 10px rgba(6, 20, 18, 0.55);
}
.level {
  padding: 0.18em 0.75em;
  border: 1px solid rgba(247, 244, 236, 0.5);
  border-radius: 999px;
  background: rgba(11, 28, 26, 0.5);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.body {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-7);
  padding-top: var(--space-7);
  padding-bottom: var(--space-7);
}
.main {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}
.h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: 1.3rem;
  color: var(--color-text-strong);
  padding-left: 0.6em;
  border-left: 3px solid var(--color-cinnabar-500);
}
.intro {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-md);
  line-height: 2;
  color: var(--color-text-muted);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.highlights {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.highlights li {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--fs-sm);
}
.num {
  font-family: var(--font-serif);
  color: var(--color-gold-600);
  font-size: var(--fs-xs);
}
.tips {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-2);
}
.tips li {
  position: relative;
  padding-left: 1.4em;
  font-size: var(--fs-sm);
  line-height: 1.85;
  color: var(--color-text-muted);
}
.tips li::before {
  content: '◆';
  position: absolute;
  left: 0;
  color: var(--color-brand-400);
  font-size: 0.7em;
  top: 0.35em;
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
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.fact-card h2 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-serif);
  font-size: 1.1rem;
}
.fact-card dl {
  margin: 0;
  display: grid;
  gap: var(--space-3);
}
.fact-card dt {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  margin-bottom: 0.15em;
}
.fact-card dd {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--color-text);
}
.link {
  display: inline-block;
  margin-top: var(--space-4);
  font-size: var(--fs-sm);
  color: var(--color-brand-600);
  text-decoration: none;
}
.side-note {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-gold-500) 10%, transparent);
  border: 1px dashed var(--color-gold-500);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.side-note p {
  margin: 0 0 var(--space-2);
}
.ask {
  border: 0;
  background: none;
  color: var(--color-gold-700);
  cursor: pointer;
  font-size: var(--fs-sm);
  padding: 0;
}
.related {
  padding-bottom: var(--space-7);
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.back {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) var(--space-8);
  border-top: 1px dashed var(--color-border);
}
.back-link {
  color: var(--color-brand-600);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.back-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.missing {
  padding: var(--space-9) var(--space-5);
}
.all {
  text-align: center;
  color: var(--color-text-faint);
  font-size: var(--fs-sm);
}
@media (max-width: 1023px) {
  .body {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
  .highlights {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 767px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>