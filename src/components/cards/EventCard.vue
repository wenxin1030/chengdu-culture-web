<script setup lang="ts">
/** 文化活动卡片：月份徽标、地点、票价与分类 */
import BaseCard from '@/components/common/BaseCard.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import { images } from '@/assets/images'
import type { CultureEvent } from '@/types'

const props = defineProps<{ event: CultureEvent; eager?: boolean }>()
</script>

<template>
  <BaseCard :to="'/culture/' + props.event.id" padding="none" class="event-card">
    <div class="cover">
      <SmartImage :src="images[props.event.img]" :alt="props.event.name + ' 活动图片'" ratio="16 / 10" :eager="props.eager" />
      <span class="month">
        <strong>{{ props.event.month }}</strong>
        <small>月</small>
      </span>
      <span class="category">{{ props.event.category }}</span>
    </div>
    <div class="body">
      <h3 class="name">{{ props.event.name }}</h3>
      <p class="summary">{{ props.event.summary }}</p>
      <dl class="facts">
        <div>
          <dt>地点</dt>
          <dd>{{ props.event.place }}</dd>
        </div>
        <div>
          <dt>时间</dt>
          <dd>{{ props.event.duration }}</dd>
        </div>
        <div>
          <dt>票价</dt>
          <dd>{{ props.event.price }}</dd>
        </div>
      </dl>
      <ul class="tags">
        <li v-for="tag in props.event.tags.slice(0, 3)" :key="tag">
          <TagPill tone="gold">{{ tag }}</TagPill>
        </li>
      </ul>
    </div>
  </BaseCard>
</template>

<style scoped>
.event-card {
  overflow: hidden;
}
.cover {
  position: relative;
}
.month {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-paper-50) 90%, transparent);
  color: var(--color-cinnabar-600);
  line-height: 1;
  backdrop-filter: blur(4px);
}
.month strong {
  font-family: var(--font-serif);
  font-size: 1.25rem;
}
.month small {
  font-size: 0.6rem;
  color: var(--color-text-faint);
}
.category {
  position: absolute;
  bottom: 0.7rem;
  right: 0.7rem;
  padding: 0.15em 0.6em;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink-900) 68%, transparent);
  color: var(--color-gold-200);
  font-size: var(--fs-xs);
}
.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.name {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--color-text-strong);
}
.summary {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.75;
  color: var(--color-text-muted);
}
.facts {
  display: grid;
  gap: 0.25rem;
  margin: 0;
  font-size: var(--fs-xs);
}
.facts div {
  display: flex;
  gap: 0.5em;
}
.facts dt {
  flex: 0 0 2.6em;
  color: var(--color-text-faint);
}
.facts dd {
  margin: 0;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
