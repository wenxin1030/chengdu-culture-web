<script setup lang="ts">
/** 游记攻略列表：标签筛选 + 天数筛选 + 排序 */
import { computed, ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import GuideCard from '@/components/cards/GuideCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { guideTags, guides } from '@/data/guides'
import { scoreMatch } from '@/utils/search'

useSeo({
  title: () => '游记攻略 · 照着走就好',
  description: () => '成都游记攻略：三天两夜经典路线、熊猫基地半日、雨天博物馆、锦江夜游、亲子研学与都江堰一日。',
  keywords: () => '成都攻略,三天两夜,成都行程,亲子游,夜游锦江,都江堰攻略',
})

const filters = ref<Record<string, string>>({ 主题: '全部', 天数: '全部' })
const keyword = ref('')
const sort = ref<'人气' | '最新' | '预算'>('人气')

const filtered = computed(() => {
  const tag = filters.value['主题'] ?? '全部'
  const days = filters.value['天数'] ?? '全部'
  const q = keyword.value.trim()
  const list = guides.filter((guide) => {
    if (tag !== '全部' && !guide.tags.includes(tag)) return false
    if (days === '3 天以内' && guide.days > 3) return false
    if (days === '4 天以上' && guide.days < 4) return false
    if (!q) return true
    const { score } = scoreMatch(q, [
      { text: guide.title, weight: 6 },
      { text: guide.tags.join(' '), weight: 3 },
      { text: guide.subtitle, weight: 2 },
      { text: guide.excerpt, weight: 1 },
      { text: guide.sections.map((s) => s.title + s.paragraphs.join('')).join(' '), weight: 1 },
    ])
    return score > 0
  })
  return [...list].sort((a, b) => {
    if (sort.value === '最新') return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (sort.value === '预算') return a.budget - b.budget
    return b.views - a.views
  })
})

function reset() {
  filters.value = { 主题: '全部', 天数: '全部' }
  keyword.value = ''
  sort.value = '人气'
}
</script>

<template>
  <div class="guides-view">
    <PageHero
      kicker="TRAVEL GUIDES"
      title="读一篇攻略，&#10;再出发"
      desc="这些路线都按真实步行与换乘时间核算过：几天走几处、预算多少、雨天备选是什么，写清楚再出发。"
      :img="images.guide3Days"
      img-alt="成都三日游攻略封面：山水与城市"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '游记攻略' }]"
    />

    <div class="container page">
      <FilterBar
        :groups="[
          { label: '主题', options: [...guideTags] },
          { label: '天数', options: ['全部', '3 天以内', '4 天以上'] },
        ]"
        v-model="filters"
        v-model:keyword="keyword"
        :total="filtered.length"
        placeholder="搜索攻略标题、路线或关键词…"
        @reset="reset"
      />

      <div class="sort-row">
        <span class="label">排序</span>
        <button
          v-for="option in ['人气', '最新', '预算'] as const"
          :key="option"
          type="button"
          class="sort"
          :class="{ 'is-active': sort === option }"
          :aria-pressed="sort === option"
          @click="sort = option"
        >
          {{ option }}
        </button>
      </div>

      <RevealSection class="list">
        <div v-if="filtered.length" class="grid-3">
          <GuideCard v-for="(guide, i) in filtered" :key="guide.id" :guide="guide" :eager="i < 3" />
        </div>
        <EmptyState v-else title="没有匹配的攻略" desc="换个主题或清空关键词再试。">
          <button type="button" class="reset" @click="reset">重置筛选</button>
        </EmptyState>
      </RevealSection>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
}
.sort-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: var(--space-4) 0 var(--space-2);
}
.label {
  font-size: var(--fs-sm);
  color: var(--color-text-faint);
}
.sort {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.25em 0.8em;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.sort.is-active {
  border-color: var(--color-brand-500);
  color: var(--color-brand-700);
  background: var(--color-brand-50);
}
.list {
  margin-top: var(--space-4);
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.reset {
  margin-top: var(--space-3);
  border: 1px solid var(--color-brand-300);
  background: var(--color-surface);
  color: var(--color-brand-700);
  border-radius: 999px;
  padding: 0.4em 1.1em;
  cursor: pointer;
}
@media (max-width: 1023px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 767px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>