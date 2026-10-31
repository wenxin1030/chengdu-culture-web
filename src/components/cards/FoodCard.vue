<script setup lang="ts">
/** 美食卡片：辣度、价格、推荐店铺 */
import BaseCard from '@/components/common/BaseCard.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import { images } from '@/assets/images'
import { spiceLevel } from '@/data/food'
import type { Food } from '@/types'

const props = defineProps<{ food: Food; eager?: boolean }>()
</script>

<template>
  <BaseCard :to="'/food/' + props.food.id" padding="none" class="food-card">
    <SmartImage :src="images[props.food.img]" :alt="props.food.name + ' 美食图片'" ratio="4 / 3" :eager="props.eager" />
    <div class="body">
      <div class="title-row">
        <h3 class="name">{{ props.food.name }}</h3>
        <span class="price">{{ props.food.price }}</span>
      </div>
      <p class="summary">{{ props.food.summary }}</p>
      <div class="meta">
        <span class="spicy" :aria-label="'辣度：' + spiceLevel[props.food.spicy]">
          <span class="chili" aria-hidden="true">🌶</span>
          <span class="dots">
            <i v-for="n in 3" :key="n" :class="{ on: n <= props.food.spicy }"></i>
          </span>
          <span class="spicy-text">{{ spiceLevel[props.food.spicy] }}</span>
        </span>
        <RatingStars :value="props.food.rating" />
      </div>
      <ul class="tags">
        <li v-for="tag in props.food.tags.slice(0, 3)" :key="tag">
          <TagPill tone="cinnabar">{{ tag }}</TagPill>
        </li>
      </ul>
    </div>
  </BaseCard>
</template>

<style scoped>
.food-card {
  overflow: hidden;
}
.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.name {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--color-text-strong);
}
.price {
  font-size: var(--fs-xs);
  color: var(--color-gold-700);
  white-space: nowrap;
}
.summary {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.75;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.spicy {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.chili {
  font-size: 0.85rem;
}
.dots {
  display: inline-flex;
  gap: 2px;
}
.dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border-strong);
}
.dots i.on {
  background: var(--color-cinnabar-500);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
