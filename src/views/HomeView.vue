<script setup lang="ts">
/**
 * 宣传主页
 * 版块：轮播主视觉 → 城市数据 → 城市名片 → 精选景区 → 文化活动 → 特色美食
 *       → 游记攻略 → 实时天气与出行提示 → 智能助手 → 快捷入口
 * 同时包含任务书要求的「边栏导航」与「页脚」结构。
 */
import { computed } from 'vue'
import BaseCarousel, { type Slide } from '@/components/common/BaseCarousel.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import StatCounter from '@/components/common/StatCounter.vue'
import WeatherWidget from '@/components/common/WeatherWidget.vue'
import ChatAssistant from '@/components/common/ChatAssistant.vue'
import ScenicCard from '@/components/cards/ScenicCard.vue'
import FoodCard from '@/components/cards/FoodCard.vue'
import EventCard from '@/components/cards/EventCard.vue'
import GuideCard from '@/components/cards/GuideCard.vue'
import SiteSidebar from '@/components/layout/SiteSidebar.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { scenicSpots } from '@/data/scenic'
import { foods } from '@/data/food'
import { cultureEvents } from '@/data/culture'
import { guides } from '@/data/guides'
import { cityStats, cityTraits } from '@/data/city'

useSeo({
  title: () => '天府成都 · 锦官城文化宣传网',
  description: () =>
    '走进成都：三千年城名未改的天府之国。城市介绍、文化活动、十大经典景区、游记攻略、特色美食与交通路线一站直达。',
  keywords: () => '成都,天府之国,成都旅游,熊猫基地,都江堰,川剧变脸,成都美食,成都攻略',
})

const slides = computed<Slide[]>(() => [
  {
    id: 's1',
    img: images.hero1,
    alt: '锦江晨晓：薄雾中的成都山水与竹林',
    kicker: 'TIANFU CHENGDU',
    title: '天府之国，\n三千年城名未改',
    subtitle: '一半山水一半城，在墨韵与烟火之间读懂成都。',
    to: '/city',
    cta: '走进成都',
  },
  {
    id: 's2',
    img: images.hero2,
    alt: '雪山下的公园城市：远山与城市天际线',
    kicker: 'PARK CITY',
    title: '雪山下的\n公园城市',
    subtitle: '推窗见雪山，出门入绿道，这是成都人的日常。',
    to: '/scenic',
    cta: '经典景区',
  },
  {
    id: 's3',
    img: images.hero3,
    alt: '锦里夜色：灯笼与老街',
    kicker: 'NIGHT OF JINLI',
    title: '一盏灯笼，\n照亮千年烟火',
    subtitle: '川剧变脸、盖碗茶与火锅香气，组成成都的夜。',
    to: '/culture',
    cta: '文化活动',
  },
  {
    id: 's4',
    img: images.hero4,
    alt: '夜泊锦官：江面倒影与城市灯火',
    kicker: 'NIGHT CRUISE',
    title: '夜泊锦官，\n江上灯火可亲',
    subtitle: '从东门码头登船，顺着锦江漂过九眼桥。',
    to: '/guides/3days',
    cta: '三天两夜攻略',
  },
])

const featuredScenic = computed(() => scenicSpots.slice(0, 4))
const featuredFood = computed(() => foods.slice(0, 4))
const featuredCulture = computed(() => cultureEvents.slice(0, 3))
const featuredGuides = computed(() => guides.slice(0, 3))

const sideItems = [
  { id: 'hero', label: '城市名片', icon: '🏯' },
  { id: 'stats', label: '数据成都', icon: '📊' },
  { id: 'traits', label: '城市气质', icon: '🀄' },
  { id: 'scenic', label: '经典景区', icon: '⛰️' },
  { id: 'culture', label: '文化活动', icon: '🎭' },
  { id: 'food', label: '特色美食', icon: '🍲' },
  { id: 'guides', label: '游记攻略', icon: '🧭' },
  { id: 'weather', label: '今日天气', icon: '🌤️' },
  { id: 'assistant', label: '智能助手', icon: '✦' },
]
</script>

<template>
  <div class="home">
    <SiteSidebar :items="sideItems" />

    <!-- 主视觉轮播 -->
    <section id="hero" class="hero">
      <BaseCarousel :slides="slides" :interval="6500" />
    </section>

    <!-- 城市数据 -->
    <section id="stats" class="stats-section">
      <div class="container">
        <ul class="stats">
          <li v-for="stat in cityStats" :key="stat.label">
            <StatCounter :value="stat.value" :suffix="stat.suffix" :unit="stat.unit" :label="stat.label" />
          </li>
        </ul>
      </div>
    </section>

    <!-- 城市气质 -->
    <RevealSection id="traits" class="section">
      <div class="container">
        <SectionHeading
          kicker="CITY CHARACTER"
          title="成都的城市气质"
          desc="熊猫、火锅、川剧、雪山、诗歌与茶——六张名片，构成一座城的性格。"
        >
          <template #action>
            <RouterLink to="/city" class="more">了解城市 →</RouterLink>
          </template>
        </SectionHeading>

        <ul class="traits">
          <li v-for="(trait, index) in cityTraits" :key="trait.title" :style="{ animationDelay: index * 60 + 'ms' }">
            <span class="t-icon" aria-hidden="true">{{ trait.icon }}</span>
            <h3>{{ trait.title }}</h3>
            <p>{{ trait.desc }}</p>
          </li>
        </ul>
      </div>
    </RevealSection>

    <!-- 精选景区 -->
    <RevealSection id="scenic" class="section is-alt">
      <div class="container">
        <SectionHeading kicker="SCENIC SPOTS" title="精选经典景区" desc="从水利奇迹到竹林禅意，十处必游目的地中的四处代表。">
          <template #action>
            <RouterLink to="/scenic" class="more">全部景区 →</RouterLink>
          </template>
        </SectionHeading>
        <div class="grid-4">
          <ScenicCard v-for="(spot, i) in featuredScenic" :key="spot.id" :scenic="spot" :eager="i < 2" />
        </div>
      </div>
    </RevealSection>

    <!-- 文化活动 -->
    <RevealSection id="culture" class="section">
      <div class="container">
        <SectionHeading kicker="CULTURE EVENTS" title="正在发生的文化活动" desc="灯会、变脸、庙会与音乐节，一年四季都有热闹可赶。">
          <template #action>
            <RouterLink to="/culture" class="more">文化活动 →</RouterLink>
          </template>
        </SectionHeading>
        <div class="grid-3">
          <EventCard v-for="event in featuredCulture" :key="event.id" :event="event" />
        </div>
      </div>
    </RevealSection>

    <!-- 特色美食 -->
    <RevealSection id="food" class="section is-alt">
      <div class="container">
        <SectionHeading kicker="CHENGDU FOOD" title="世界美食之都的打开方式" desc="从红汤火锅到一碗盖碗茶，辣与不辣都有讲究。">
          <template #action>
            <RouterLink to="/food" class="more">全部美食 →</RouterLink>
          </template>
        </SectionHeading>
        <div class="grid-4">
          <FoodCard v-for="food in featuredFood" :key="food.id" :food="food" />
        </div>
      </div>
    </RevealSection>

    <!-- 游记攻略 -->
    <RevealSection id="guides" class="section">
      <div class="container">
        <SectionHeading kicker="TRAVEL GUIDES" title="读一篇攻略，再出发" desc="三天两夜、熊猫一日、雨天博物馆、夜游锦江——真实路线与预算。">
          <template #action>
            <RouterLink to="/guides" class="more">全部攻略 →</RouterLink>
          </template>
        </SectionHeading>
        <div class="grid-3">
          <GuideCard v-for="guide in featuredGuides" :key="guide.id" :guide="guide" />
        </div>
      </div>
    </RevealSection>

    <!-- 天气与智能助手 -->
    <RevealSection id="weather" class="section is-alt">
      <div class="container weather-wrap">
        <div class="weather-col">
          <SectionHeading kicker="LIVE WEATHER" title="今天的成都，适合出门吗？" desc="天气数据来自 open-meteo 公共接口，每 30 分钟自动刷新一次。" />
          <WeatherWidget variant="card" />
          <p class="weather-note">
            出行建议：<RouterLink to="/traffic">查看交通路线</RouterLink> · <RouterLink to="/guides">查看雨天备选攻略</RouterLink>
          </p>
        </div>

        <div id="assistant" class="assistant-col">
          <SectionHeading
            kicker="AI ASSISTANT"
            title="问一句，锦官小助手就懂"
            desc="基于站内文旅知识库的智能问答：景点、美食、交通、行程一次问清。"
          />
          <ChatAssistant inline />
        </div>
      </div>
    </RevealSection>

    <!-- 快捷入口 -->
    <RevealSection class="section">
      <div class="container">
        <div class="cta-band">
          <div>
            <h2>还没想好怎么安排？</h2>
            <p>先看看城市服务与交通换乘，再挑一条攻略照着走。</p>
          </div>
          <div class="cta-actions">
            <RouterLink to="/service" class="btn primary">城市服务</RouterLink>
            <RouterLink to="/traffic" class="btn">交通路线</RouterLink>
            <RouterLink to="/search" class="btn">全站搜索</RouterLink>
          </div>
        </div>
      </div>
    </RevealSection>
  </div>
</template>

<style scoped>
.hero {
  max-width: var(--container-wide);
  margin-inline: auto;
}
.stats-section {
  padding: var(--space-7) 0;
  border-bottom: 1px solid var(--color-border);
}
.stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.section {
  padding: var(--space-9) 0;
}
.section.is-alt {
  background: color-mix(in srgb, var(--color-brand-50) 55%, transparent);
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.more {
  font-size: var(--fs-sm);
  color: var(--color-brand-600);
  text-decoration: none;
  white-space: nowrap;
}
.more:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.traits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.traits li {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition:
    transform var(--dur-md) var(--ease-out),
    border-color var(--dur-md);
}
.traits li:hover {
  transform: translateY(-4px);
  border-color: var(--color-brand-200);
}
.t-icon {
  font-size: 1.6rem;
}
.traits h3 {
  margin: var(--space-3) 0 var(--space-2);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-text-strong);
}
.traits p {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.8;
  color: var(--color-text-muted);
}
.weather-wrap {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: var(--space-7);
  align-items: start;
}
.weather-note {
  margin: var(--space-3) 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.weather-note a {
  color: var(--color-brand-600);
}
.assistant-col {
  scroll-margin-top: 96px;
}
.cta-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  padding: var(--space-7);
  border-radius: var(--radius-xl);
  background: linear-gradient(120deg, var(--color-brand-800), var(--color-brand-600) 65%, var(--color-brand-500));
  color: #f4f1e8;
  flex-wrap: wrap;
}
.cta-band h2 {
  margin: 0 0 var(--space-2);
  font-family: var(--font-serif);
  font-size: clamp(1.3rem, 1.1rem + 1vw, 1.9rem);
}
.cta-band p {
  margin: 0;
  opacity: 0.85;
}
.cta-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.btn {
  padding: 0.65em 1.4em;
  border-radius: 999px;
  border: 1px solid rgba(244, 241, 232, 0.5);
  color: #f4f1e8;
  text-decoration: none;
  font-size: var(--fs-sm);
  transition: background var(--dur-sm);
}
.btn:hover {
  background: rgba(244, 241, 232, 0.14);
}
.btn.primary {
  background: var(--color-paper-50);
  color: var(--color-brand-800);
  border-color: transparent;
  font-weight: 600;
}
.btn.primary:hover {
  background: var(--color-gold-300);
}
@media (max-width: 1100px) {
  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3) var(--space-4);
  }
  .weather-wrap {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 767px) {
  .grid-3,
  .traits {
    grid-template-columns: 1fr;
  }
  .grid-4 {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .section {
    padding: var(--space-7) 0;
  }
}
</style>