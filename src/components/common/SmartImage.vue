<script setup lang="ts">
/**
 * 图片组件：统一处理懒加载、宽高比占位与 alt。
 * SVG 资源体积极小，仍保留 lazy 以减少首屏网络占用。
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    ratio?: string
    eager?: boolean
    zoom?: boolean
  }>(),
  { ratio: '4 / 3', eager: false, zoom: true },
)
</script>

<template>
  <figure class="smart-image" :class="{ 'is-zoom': props.zoom }" :style="{ aspectRatio: props.ratio }">
    <img
      :src="props.src"
      :alt="props.alt"
      :loading="props.eager ? 'eager' : 'lazy'"
      :fetchpriority="props.eager ? 'high' : 'auto'"
      decoding="async"
      width="1000"
      height="750"
    />
    <slot />
  </figure>
</template>

<style scoped>
.smart-image {
  position: relative;
  margin: 0;
  overflow: hidden;
  background: var(--color-surface-alt);
  border-radius: inherit;
}
.smart-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 600ms var(--ease-out);
}
.is-zoom:hover img {
  transform: scale(1.045);
}
@media (prefers-reduced-motion: reduce) {
  .is-zoom:hover img {
    transform: none;
  }
}
</style>
