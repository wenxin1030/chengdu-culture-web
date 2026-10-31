<script setup lang="ts">
/** 评分星级：支持半星 + 数值文本，配合 aria-label 提供无障碍语义 */
const props = withDefaults(defineProps<{ value: number; max?: number; showValue?: boolean }>(), {
  max: 5,
  showValue: true,
})
const percent = () => Math.max(0, Math.min(100, (props.value / props.max) * 100))
</script>

<template>
  <span class="rating" :aria-label="'评分 ' + value + ' 分，满分 ' + max + ' 分'">
    <span class="stars" aria-hidden="true">
      <span class="empty">★★★★★</span>
      <span class="fill" :style="{ width: percent() + '%' }">★★★★★</span>
    </span>
    <span v-if="showValue" class="value">{{ value.toFixed(1) }}</span>
  </span>
</template>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-size: var(--fs-sm);
}
.stars {
  position: relative;
  display: inline-block;
  letter-spacing: 0.08em;
  line-height: 1;
}
.empty {
  color: var(--color-border-strong);
}
.fill {
  position: absolute;
  inset: 0;
  overflow: hidden;
  white-space: nowrap;
  color: var(--color-gold-500);
}
.value {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
