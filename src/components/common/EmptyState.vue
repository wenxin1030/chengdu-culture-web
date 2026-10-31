<script setup lang="ts">
/** 空状态：筛选无结果、搜索无命中时使用 */
withDefaults(defineProps<{ title?: string; desc?: string; icon?: string }>(), {
  title: '没有找到相关内容',
  desc: '换个关键词或清空筛选条件再试试。',
  icon: '🔍',
})
</script>

<template>
  <div class="empty" role="status">
    <span class="icon" aria-hidden="true">{{ icon }}</span>
    <p class="title">{{ title }}</p>
    <p class="desc">{{ desc }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-9) var(--space-4);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  background: var(--color-surface-alt);
  text-align: center;
}
.icon {
  font-size: 2rem;
  opacity: 0.7;
}
.title {
  margin: 0;
  font-weight: 600;
  color: var(--color-text-strong);
}
.desc {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
</style>
