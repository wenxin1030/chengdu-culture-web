<script setup lang="ts">
/** 景区卡片：封面、等级、评分、标签与收藏 */
import BaseCard from '@/components/common/BaseCard.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import { images } from '@/assets/images'
import { formatCompact } from '@/utils/format'
import { useAppStore } from '@/stores/app'
import type { ScenicSpot } from '@/types'

const props = defineProps<{ scenic: ScenicSpot; eager?: boolean }>()
const app = useAppStore()

function toggle(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  app.toggleFavorite('scenic-' + props.scenic.id)
}
</script>

<template>
  <BaseCard :to="'/scenic/' + props.scenic.id" padding="none" class="scenic-card">
    <div class="cover">
      <SmartImage :src="images[props.scenic.img]" :alt="props.scenic.name + ' 景点风光'" ratio="4 / 3" :eager="props.eager" />
      <span class="level">{{ props.scenic.level }}</span>
      <button
        type="button"
        class="fav"
        :class="{ 'is-on': app.isFavorite('scenic-' + props.scenic.id) }"
        :aria-pressed="app.isFavorite('scenic-' + props.scenic.id)"
        :aria-label="(app.isFavorite('scenic-' + props.scenic.id) ? '取消收藏' : '收藏') + props.scenic.name"
        @click="toggle"
      >
        <span aria-hidden="true">{{ app.isFavorite('scenic-' + props.scenic.id) ? '★' : '☆' }}</span>
      </button>
    </div>

    <div class="body">
      <div class="title-row">
        <h3 class="name">{{ props.scenic.name }}</h3>
        <span class="en">{{ props.scenic.enName }}</span>
      </div>
      <p class="summary">{{ props.scenic.summary }}</p>
      <div class="meta">
        <RatingStars :value="props.scenic.rating" />
        <span class="heat">{{ formatCompact(props.scenic.heat) }} 热度</span>
      </div>
      <ul class="tags">
        <li v-for="tag in props.scenic.tags.slice(0, 3)" :key="tag">
          <TagPill tone="muted">{{ tag }}</TagPill>
        </li>
      </ul>
    </div>
  </BaseCard>
</template>

<style scoped>
.scenic-card {
  overflow: hidden;
}
.cover {
  position: relative;
}
.level {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.15em 0.6em;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink-900) 72%, transparent);
  color: var(--color-gold-200);
  font-size: var(--fs-xs);
  backdrop-filter: blur(4px);
}
.fav {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-paper-50) 80%, transparent);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1rem;
  transition:
    color var(--dur-sm),
    transform var(--dur-sm);
}
.fav:hover {
  transform: scale(1.08);
}
.fav.is-on {
  color: var(--color-gold-600);
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
  gap: 0.5em;
}
.name {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--color-text-strong);
}
.en {
  font-size: var(--fs-xs);
  letter-spacing: 0.06em;
  color: var(--color-text-faint);
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
.heat {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
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
