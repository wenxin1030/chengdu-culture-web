<script setup lang="ts">
/** 区块标题：kicker 小字 + 标题 + 描述 + 右侧操作 */
withDefaults(
  defineProps<{
    kicker?: string
    title: string
    desc?: string
    align?: 'left' | 'center'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <header class="section-heading" :class="'align-' + align">
    <div class="text">
      <p v-if="kicker" class="kicker">
        <span class="dot" aria-hidden="true"></span>{{ kicker }}
      </p>
      <h2 class="title">{{ title }}</h2>
      <p v-if="desc" class="desc">{{ desc }}</p>
    </div>
    <div v-if="$slots.action" class="action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
.align-center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  margin: 0 0 var(--space-2);
  font-size: var(--fs-sm);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-brand-600);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-cinnabar-500);
}
.title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.4rem, 1.1rem + 1.2vw, 2rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--color-text-strong);
}
.desc {
  max-width: 62ch;
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-md);
  line-height: 1.8;
}
.action {
  flex-shrink: 0;
}
@media (max-width: 767px) {
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
