<script setup lang="ts">
/** 美食详情页：做法、推荐区域与店铺、辣度与相似推荐 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import FoodCard from '@/components/cards/FoodCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { getFoodById, foods, spiceLevel } from '@/data/food'
import { recommendFood } from '@/utils/recommend'

const route = useRoute()
const food = computed(() => getFoodById(String(route.params.id)))
const related = computed(() => (food.value ? recommendFood(food.value, foods, 3) : []))

useSeo({
  title: () => food.value?.name ?? '美食详情',
  description: () => food.value?.summary ?? '成都特色美食详情',
  keywords: () => food.value?.tags.join(',') ?? '成都美食',
})
</script>

<template>
  <div v-if="food" class="detail">
    <div class="container top">
      <div class="media">
        <SmartImage :src="images[food.img]" :alt="food.name" ratio="4 / 3" :eager="true" />
      </div>
      <div class="copy">
        <nav class="crumbs" aria-label="面包屑">
          <RouterLink to="/">首页</RouterLink>
          <span aria-hidden="true">/</span>
          <RouterLink to="/food">特色美食</RouterLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ food.name }}</span>
        </nav>
        <p class="en">{{ food.enName }}</p>
        <h1>{{ food.name }}</h1>
        <p class="summary">{{ food.summary }}</p>
        <div class="meta">
          <span class="price">{{ food.price }}</span>
          <span class="spicy">
            <span aria-hidden="true">🌶</span>
            辣度：{{ spiceLevel[food.spicy] }}
          </span>
          <RatingStars :value="food.rating" />
        </div>
        <ul class="tags">
          <li v-for="tag in food.tags" :key="tag">
            <TagPill tone="cinnabar">{{ tag }}</TagPill>
          </li>
        </ul>
      </div>
    </div>

    <div class="container body">
      <RevealSection class="intro-block">
        <h2 class="h2">这道菜的故事</h2>
        <p class="intro">{{ food.intro }}</p>
      </RevealSection>

      <div class="two-col">
        <RevealSection class="panel">
          <h2 class="h2">去哪儿吃</h2>
          <p class="hint">推荐区域</p>
          <ul class="chips">
            <li v-for="district in food.districts" :key="district">{{ district }}</li>
          </ul>
          <p class="hint">常见店铺</p>
          <ul class="shops">
            <li v-for="shop in food.shops" :key="shop">{{ shop }}</li>
          </ul>
          <p class="note">以上为教学演示整理的口碑店铺，营业时间与人均以现场为准。</p>
        </RevealSection>

        <RevealSection class="panel">
          <h2 class="h2">点单小技巧</h2>
          <ul class="tips">
            <li v-if="food.spicy >= 3">怕辣的话先点鸳鸯锅，或让店家做「微辣」，蘸碟加香油与醋能明显降压。</li>
            <li v-if="food.spicy === 2">成都的「中辣」对外地人已偏重，第一次建议按微辣点，再加干碟调整。</li>
            <li v-if="food.spicy <= 1">不辣的选择也很多，可与重辣菜品搭配，形成一桌平衡的味型。</li>
            <li>小吃街建议避开景区正门第一家，往里走两条街价格更实在。</li>
            <li>热门店多在 18:00 后排队，可提前在线上取号。</li>
          </ul>
        </RevealSection>
      </div>
    </div>

    <RevealSection class="container related">
      <SectionHeading kicker="TASTE MORE" title="相似的味道" desc="按标签与辣度相似度推荐，换一家也不踩雷。" />
      <div class="grid-3">
        <FoodCard v-for="item in related" :key="item.id" :food="item" />
      </div>
    </RevealSection>

    <div class="container back">
      <RouterLink to="/food" class="back-link">← 返回全部美食</RouterLink>
      <RouterLink to="/guides" class="back-link">看美食主题攻略 →</RouterLink>
    </div>
  </div>

  <div v-else class="container missing">
    <EmptyState title="没有找到这道美食" desc="去美食列表页看看其他推荐吧。">
      <RouterLink to="/food" class="back-link">返回美食列表</RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-7);
  align-items: center;
  padding-top: var(--space-7);
  padding-bottom: var(--space-7);
}
.media {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.crumbs {
  display: flex;
  gap: 0.4em;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  margin-bottom: var(--space-3);
}
.crumbs a {
  color: inherit;
  text-decoration: none;
}
.en {
  margin: 0 0 0.2em;
  font-size: var(--fs-xs);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-gold-600);
}
h1 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 1.4rem + 1.8vw, 2.6rem);
  color: var(--color-text-strong);
}
.summary {
  margin: 0 0 var(--space-4);
  font-size: var(--fs-md);
  line-height: 1.9;
  color: var(--color-text-muted);
}
.meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  flex-wrap: wrap;
}
.price {
  color: var(--color-gold-700);
  font-weight: 600;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.body {
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
  margin: 0;
  font-size: var(--fs-md);
  line-height: 2;
  color: var(--color-text-muted);
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}
.panel {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.hint {
  margin: var(--space-3) 0 var(--space-2);
  font-size: var(--fs-xs);
  letter-spacing: 0.1em;
  color: var(--color-text-faint);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.chips li {
  padding: 0.25em 0.8em;
  border-radius: 999px;
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  font-size: var(--fs-sm);
}
.shops {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.shops li::before {
  content: '·';
  margin-right: 0.5em;
  color: var(--color-cinnabar-500);
}
.note {
  margin: var(--space-3) 0 0;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
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
  color: var(--color-brand-400);
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
  display: flex;
  justify-content: space-between;
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
  .top,
  .two-col {
    grid-template-columns: 1fr;
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
