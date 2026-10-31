<script setup lang="ts">
/**
 * 筛选栏：分组选项 + 关键词输入 + 结果计数
 * 用于景区 / 美食 / 活动 / 攻略列表页
 */
export interface FilterGroup {
  label: string
  options: string[]
  modelValue: string
}

const props = defineProps<{
  groups: { label: string; options: string[] }[]
  modelValue: Record<string, string>
  keyword?: string
  total: number
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
  'update:keyword': [value: string]
  reset: []
}>()

function select(groupLabel: string, option: string) {
  emit('update:modelValue', { ...props.modelValue, [groupLabel]: option })
}

function setKeyword(event: Event) {
  emit('update:keyword', (event.target as HTMLInputElement).value)
}

function isActive(groupLabel: string, option: string) {
  return (props.modelValue[groupLabel] ?? '全部') === option
}
</script>

<template>
  <div class="filter-bar">
    <div class="groups">
      <div v-for="group in props.groups" :key="group.label" class="group">
        <span class="label">{{ group.label }}</span>
        <div class="options" role="group" :aria-label="group.label + '筛选'">
          <button
            v-for="option in group.options"
            :key="option"
            type="button"
            class="option"
            :class="{ 'is-active': isActive(group.label, option) }"
            :aria-pressed="isActive(group.label, option)"
            @click="select(group.label, option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <div class="search-row">
      <label class="search">
        <span class="sr-only">关键词搜索</span>
        <span class="ico" aria-hidden="true">⌕</span>
        <input
          :value="props.keyword"
          type="search"
          :placeholder="props.placeholder ?? '输入关键词筛选…'"
          @input="setKeyword"
        />
      </label>
      <span class="count" role="status">共 <strong>{{ props.total }}</strong> 条</span>
      <button type="button" class="reset" @click="emit('reset')">重置</button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.groups {
  display: grid;
  gap: var(--space-3);
}
.group {
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
  flex-wrap: wrap;
}
.label {
  flex: 0 0 3.5em;
  font-size: var(--fs-sm);
  color: var(--color-text-faint);
}
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.option {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.3em 0.9em;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition:
    border-color var(--dur-sm),
    color var(--dur-sm),
    background var(--dur-sm);
}
.option:hover {
  border-color: var(--color-brand-300);
  color: var(--color-brand-700);
}
.option.is-active {
  background: var(--color-brand-600);
  border-color: var(--color-brand-600);
  color: #fff;
}
.search-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-border);
  flex-wrap: wrap;
}
.search {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 0.9em;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-alt);
}
.search .ico {
  color: var(--color-text-faint);
}
.search input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font: inherit;
  color: var(--color-text);
}
.count {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
}
.count strong {
  color: var(--color-brand-700);
}
.reset {
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: 999px;
  padding: 0.3em 0.9em;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.reset:hover {
  border-color: var(--color-cinnabar-400);
  color: var(--color-cinnabar-600);
}
</style>
