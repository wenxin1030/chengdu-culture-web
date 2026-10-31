<script setup lang="ts">
/** 文化活动详情页：时间地点票价、活动介绍、相关推荐 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TagPill from '@/components/common/TagPill.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { cultureEvents, getCultureById } from '@/data/culture'

const route = useRoute()
const event = computed(() => getCultureById(String(route.params.id)))
const related = computed(() =>
  cultureEvents.filter((c) => c.id !== event.value?.id && c.category === event.value?.category).slice(0, 3),
)

useSeo({
  title: () => event.value?.name ?? '活动详情',
  description: () => event.value?.summary ?? '成都文化活动详情',
  keywords: () => event.value?.tags.join(',') ?? '成都文化活动',
})

const facts = computed(() => {
  const e = event.value
  if (!e) return []
  return [
    { label: '时间', value: e.month + ' 月 · ' + e.duration },
    { label: '地点', value: e.place },
    { label: '票价', value: e.price },
    { label: '类别', value: e.category },
    { label: '季节', value: e.season },
  ]
})
</script>

<template>
  <div v-if="event" class="detail">
    <header class="hero">
      <img class="hero-img" :src="images[event.img]" :alt="event.name" fetchpriority="high" decoding="async" />
      <div class="mask" aria-hidden="true"></div>
      <div class="container inner">
        <nav class="crumbs" aria-label="面包屑">
          <RouterLink to="/">首页</RouterLink><span aria-hidden="true">/</span>
          <RouterLink to="/culture">文化活动</RouterLink><span aria-hidden="true">/</span>
          <span aria-current="page">{{ event.name }}</span>
        </nav>
        <span class="badge">{{ event.month }} 月 · {{ event.category }}</span>
        <h1>{{ event.name }}</h1>
        <p class="sub">{{ event.summary }}</p>
      </div>
    </header>

    <div class="container body">
      <div class="main">
        <RevealSection>
          <h2 class="h2">活动介绍</h2>
          <p class="intro">{{ event.intro }}</p>
          <ul class="tags">
            <li v-for="tag in event.tags" :key="tag">
              <TagPill tone="gold">{{ tag }}</TagPill>
            </li>
          </ul>
        </RevealSection>

        <RevealSection>
          <h2 class="h2">参与建议</h2>
          <ul class="tips">
            <li>建议提前 1-3 天通过官方渠道核实具体日期与场次，节假日场次通常会加场。</li>
            <li>活动现场人流较大，请看管好随身物品，照看好老人与儿童。</li>
            <li>部分演出禁止拍照录像，入场前请留意现场提示。</li>
            <li>若遇临时调整，以主办方公告为准，本站信息为教学演示整理。</li>
          </ul>
        </RevealSection>
      </div>

      <aside class="side">
        <div class="fact-card">
          <h2>活动信息</h2>
          <dl>
            <div v-for="fact in facts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <RouterLink to="/traffic" class="link">查看怎么去 →</RouterLink>
        </div>
      </aside>
    </div>

    <RevealSection v-if="related.length" class="container related">
      <SectionHeading kicker="MORE EVENTS" title="同类活动推荐" desc="同类别、同季节的其他活动，可以一起安排。" />
      <div class="grid-3">
        <EventCard v-for="item in related" :key="item.id" :event="item" />
      </div>
    </RevealSection>

    <div class="container back">
      <RouterLink to="/culture" class="back-link">← 返回文化活动</RouterLink>
    </div>
  </div>

  <div v-else class="container missing">
    <EmptyState title="活动不存在或已结束" desc="去活动列表看看当前有哪些热闹。">
      <RouterLink to="/culture" class="back-link">返回文化活动</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: clamp(320px, 30vw, 460px);
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
.mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, rgba(9, 26, 22, 0.85), rgba(9, 26, 22, 0.4) 68%, rgba(9, 26, 22, 0.12));
}
.inner {
  position: relative;
  padding: clamp(2rem, 5vw, 4rem) var(--space-5) clamp(2rem, 4vw, 3rem);
  color: #f7f4ec;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.crumbs {
  display: flex;
  gap: 0.4em;
  font-size: var(--fs-xs);
  color: rgba(247, 244, 236, 0.72);
  margin-bottom: var(--space-3);
}
.crumbs a {
  color: inherit;
  text-decoration: none;
}
.badge {
  align-self: flex-start;
  padding: 0.2em 0.8em;
  border-radius: 999px;
  border: 1px solid rgba(247, 244, 236, 0.4);
  font-size: var(--fs-xs);
  color: var(--color-gold-300);
}
h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 1.3rem + 2.4vw, 3rem);
}
.sub {
  margin: 0;
  max-width: 56ch;
  line-height: 1.9;
  color: rgba(247, 244, 236, 0.85);
}
.body {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-7);
  padding: var(--space-7) var(--space-5);
}
.main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: 1.25rem;
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
.tips {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-2);
  font-size: var(--fs-sm);
  line-height: 1.85;
  color: var(--color-text-muted);
}
.tips li {
  position: relative;
  padding-left: 1.3em;
}
.tips li::before {
  content: '◆';
  position: absolute;
  left: 0;
  top: 0.3em;
  font-size: 0.7em;
  color: var(--color-gold-500);
}
.side {
  align-self: start;
  position: sticky;
  top: 96px;
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
}
.fact-card dd {
  margin: 0.15em 0 0;
  font-size: var(--fs-sm);
  line-height: 1.7;
}
.link {
  display: inline-block;
  margin-top: var(--space-4);
  font-size: var(--fs-sm);
  color: var(--color-brand-600);
  text-decoration: none;
}
.related {
  padding-bottom: var(--space-6);
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.back {
  padding: var(--space-4) var(--space-5) var(--space-8);
  border-top: 1px dashed var(--color-border);
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
  .body {
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