<script setup lang="ts">
/** 标签 / 徽标：用于景区等级、美食辣度、活动分类等 */
withDefaults(defineProps<{ tone?: 'brand' | 'gold' | 'cinnabar' | 'muted' | 'ghost' }>(), {
  tone: 'brand',
})
</script>

<template>
  <span class="tag-pill" :class="'tone-' + tone"><slot /></span>
</template>

<style scoped>
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  font-size: var(--fs-xs);
  line-height: 1.5;
  font-weight: 500;
  white-space: nowrap;
}
.tone-brand {
  background: var(--color-brand-50);
  color: var(--color-brand-700);
}
.tone-gold {
  background: color-mix(in srgb, var(--color-gold-500) 16%, transparent);
  color: var(--color-gold-700);
}
.tone-cinnabar {
  background: color-mix(in srgb, var(--color-cinnabar-500) 14%, transparent);
  color: var(--color-cinnabar-700);
}
.tone-muted {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}
.tone-ghost {
  border: 1px solid currentColor;
  color: inherit;
}
</style>
