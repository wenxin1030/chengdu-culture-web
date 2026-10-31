<script setup lang="ts">
import { useCountUp } from '@/composables/useCountUp'
import { formatNumber } from '@/utils/format'

const props = defineProps<{ value: number; suffix?: string; unit?: string; label: string }>()
const { el, display } = useCountUp(props.value)
</script>

<template>
  <div ref="el" class="stat">
    <p class="value">
      <span class="num">{{ formatNumber(display) }}</span>
      <span v-if="suffix" class="suffix">{{ suffix }}</span>
    </p>
    <p class="label">{{ label }}</p>
    <p v-if="unit" class="unit">{{ unit }}</p>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
}
.value {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.1em;
  font-family: var(--font-serif);
  color: var(--color-brand-700);
}
.num {
  font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.suffix {
  font-size: var(--fs-lg);
  color: var(--color-gold-600);
}
.label {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.unit {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
</style>
