<script setup lang="ts">
/** 游记攻略卡片：作者、天数、预算与互动数据 */
import BaseCard from '@/components/common/BaseCard.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import { images } from '@/assets/images'
import { formatBudget, formatCompact, formatDate } from '@/utils/format'
import type { Guide } from '@/types'

const props = defineProps<{ guide: Guide; eager?: boolean }>()
</script>

<template>
  <BaseCard :to="'/guides/' + props.guide.id" padding="none" class="guide-card">
    <SmartImage :src="images[props.guide.img]" :alt="props.guide.title" ratio="16 / 9" :eager="props.eager" />
    <div class="body">
      <div class="author">
        <span class="avatar" aria-hidden="true">{{ props.guide.avatar }}</span>
        <span class="who">
          <strong>{{ props.guide.author }}</strong>
          <small>{{ formatDate(props.guide.date) }}</small>
        </span>
      </div>
      <h3 class="title">{{ props.guide.title }}</h3>
      <p class="subtitle">{{ props.guide.subtitle }}</p>
      <ul class="tags">
        <li v-for="tag in props.guide.tags.slice(0, 3)" :key="tag">
          <TagPill tone="ghost">{{ tag }}</TagPill>
        </li>
      </ul>
      <div class="stats">
        <span>{{ props.guide.days }} 天</span>
        <span>{{ formatBudget(props.guide.budget) }} / 人</span>
        <span class="push">
          <span aria-hidden="true">♥</span> {{ formatCompact(props.guide.likes) }}
          <span aria-hidden="true">👁</span> {{ formatCompact(props.guide.views) }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.guide-card {
  overflow: hidden;
}
.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}
.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-brand-100);
  color: var(--color-brand-800);
  font-family: var(--font-serif);
  font-weight: 600;
}
.who {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.who strong {
  font-size: var(--fs-sm);
  color: var(--color-text-strong);
}
.who small {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  line-height: 1.45;
  color: var(--color-text-strong);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.subtitle {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.stats {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px dashed var(--color-border);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.push {
  margin-left: auto;
  display: inline-flex;
  gap: 0.3em;
}
</style>
