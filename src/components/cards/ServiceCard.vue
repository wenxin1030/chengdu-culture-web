<script setup lang="ts">
/** 城市服务卡片：图标、分类与外部官方入口 */
import { computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import TagPill from '@/components/common/TagPill.vue'
import type { CityService } from '@/types'

const props = defineProps<{ service: CityService }>()

const GLYPHS: Record<string, string> = {
  card: '💳',
  metro: '🚇',
  plane: '✈️',
  ticket: '🎫',
  museum: '🏛️',
  stage: '🎭',
  gov: '🏢',
  phone: '☎️',
  weather: '🌤️',
  hospital: '🏥',
  gift: '🎁',
  heart: '💚',
}

const glyph = computed(() => GLYPHS[props.service.icon] ?? '◈')
</script>

<template>
  <BaseCard tag="div" padding="md" class="service-card">
    <div class="top">
      <span class="glyph" aria-hidden="true">{{ glyph }}</span>
      <span v-if="props.service.badge" class="badge">{{ props.service.badge }}</span>
    </div>
    <h3 class="name">{{ props.service.name }}</h3>
    <p class="desc">{{ props.service.desc }}</p>
    <div class="foot">
      <TagPill tone="brand">{{ props.service.category }}</TagPill>
      <a class="go" :href="props.service.link" target="_blank" rel="noopener noreferrer">
        打开官方入口<span aria-hidden="true">↗</span>
      </a>
    </div>
  </BaseCard>
</template>

<style scoped>
.service-card {
  gap: var(--space-2);
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.glyph {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-brand-50);
  font-size: 1.3rem;
}
.badge {
  padding: 0.1em 0.6em;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-cinnabar-500) 12%, transparent);
  color: var(--color-cinnabar-600);
  font-size: var(--fs-xs);
}
.name {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.05rem;
  color: var(--color-text-strong);
}
.desc {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--color-text-muted);
  flex: 1;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px dashed var(--color-border);
}
.go {
  font-size: var(--fs-xs);
  color: var(--color-brand-600);
  text-decoration: none;
  white-space: nowrap;
}
.go:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
