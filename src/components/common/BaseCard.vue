<script setup lang="ts">
/**
 * 通用卡片容器
 * - 通过 tag 支持 article / div / li 等语义化标签
 * - hoverable 控制悬浮动效，to 存在时渲染为 router-link
 */
import { RouterLink } from 'vue-router'

const props = withDefaults(
  defineProps<{
    to?: string
    tag?: 'div' | 'article' | 'li' | 'section'
    hoverable?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    tone?: 'paper' | 'plain' | 'ink'
  }>(),
  { tag: 'article', hoverable: true, padding: 'md', tone: 'paper' },
)
</script>

<template>
  <component
    :is="props.to ? RouterLink : props.tag"
    :to="props.to"
    class="base-card"
    :class="[
      'is-' + props.padding,
      'tone-' + props.tone,
      { 'is-hoverable': props.hoverable, 'is-link': !!props.to },
    ]"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: inherit;
  text-decoration: none;
  transition:
    transform var(--dur-md) var(--ease-out),
    box-shadow var(--dur-md) var(--ease-out),
    border-color var(--dur-md) var(--ease-out);
}
.tone-plain {
  background: transparent;
}
.tone-ink {
  background: var(--color-ink-900);
  color: var(--color-paper-50);
  border-color: transparent;
}
.is-none {
  padding: 0;
}
.is-sm {
  padding: var(--space-3);
}
.is-md {
  padding: var(--space-5);
}
.is-lg {
  padding: var(--space-7);
}
.is-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-brand-200);
}
.is-link:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .is-hoverable:hover {
    transform: none;
  }
}
</style>
