<script setup lang="ts">
/** 进入视口时淡入上移的区块包装（滚动动效，尊重 reduced-motion） */
import { useScrollReveal } from '@/composables/useScrollReveal'

withDefaults(defineProps<{ tag?: string; delay?: number }>(), { tag: 'section', delay: 0 })

const { target, visible } = useScrollReveal()
</script>

<template>
  <component :is="tag" ref="target" class="reveal" :class="{ 'is-visible': visible }" :style="{ transitionDelay: delay + 'ms' }">
    <slot />
  </component>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 700ms var(--ease-out),
    transform 700ms var(--ease-out);
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
