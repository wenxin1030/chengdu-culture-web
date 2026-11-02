<script setup lang="ts">
/** 特色美食列表：辣度与场景筛选 + 关键词匹配 */
import { computed, ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import FoodCard from '@/components/cards/FoodCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import TagPill from '@/components/common/TagPill.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { foods, spiceLevel } from '@/data/food'
import { scoreMatch } from '@/utils/search'

useSeo({
  title: () => '特色美食 · 世界美食之都',
  description: () => '成都特色美食：火锅、串串香、担担面、钟水饺、龙抄手、麻婆豆腐、军屯锅盔、糖油果子与盖碗茶。',
  keywords: () => '成都美食,火锅,串串,担担面,钟水饺,龙抄手,麻婆豆腐,成都小吃',
})

const filters = ref<Record<string, string>>({ 辣度: '全部', 场景: '全部' })
const keyword = ref('')

const scenes = ['全部', '必吃', '小吃', '夜宵', '早餐', '老字号', '甜品', '茶饮']

const filtered = computed(() => {
  const spicyKey = filters.value['辣度'] ?? '全部'
  const scene = filters.value['场景'] ?? '全部'
  const q = keyword.value.trim()
  const spicyIndex = spiceLevel.indexOf(spicyKey as (typeof spiceLevel)[number])
  return foods.filter((food) => {
    if (spicyIndex > 0 && food.spicy !== spicyIndex) return false
    if (scene !== '全部' && !food.tags.includes(scene)) return false
    if (!q) return true
    const { score } = scoreMatch(q, [
      { text: food.name, weight: 6 },
      { text: food.enName, weight: 2 },
      { text: food.tags.join(' '), weight: 3 },
      { text: food.summary, weight: 2 },
      { text: food.intro, weight: 1 },
      { text: food.shops.join(' '), weight: 1 },
    ])
    return score > 0
  })
})

function reset() {
  filters.value = { 辣度: '全部', 场景: '全部' }
  keyword.value = ''
}

const eatingTips = [
  '成都的“辣”多半是麻辣，香油蒜泥碟能有效缓解；怕辣可点鸳鸯锅。',
  '小吃集中在建设路、玉林、奎星楼街，景区门口的第一家通常不是最实惠的。',
  '盖碗茶是成都人的社交方式，人民公园鹤鸣茶社可以坐一下午。',
  '夜宵高峰在 21:00 之后，热门串串店需要现场取号。',
]
</script>

<template>
  <div class="food-view">
    <PageHero
      kicker="CHENGDU FOOD"
      title="世界美食之都，&#10;一口入魂"
      desc="红汤翻滚的火锅、数签签的串串、一勺芽菜肉臊的担担面——成都的美食，是把日子过成滋味。"
      :img="images.foodHero"
      img-alt="成都夜色中的灯笼与美食街"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '特色美食' }]"
    />

    <div class="container page">
      <FilterBar
        :groups="[
          { label: '辣度', options: [...spiceLevel] },
          { label: '场景', options: scenes },
        ]"
        v-model="filters"
        v-model:keyword="keyword"
        :total="filtered.length"
        placeholder="搜索美食名称、店铺或标签…"
        @reset="reset"
      />

      <RevealSection class="list">
        <div v-if="filtered.length" class="grid-3">
          <FoodCard v-for="(food, i) in filtered" :key="food.id" :food="food" :eager="i < 3" />
        </div>
        <EmptyState v-else title="没有符合条件的美食" desc="换个辣度或清空关键词试试。">
          <button type="button" class="reset" @click="reset">重置筛选</button>
        </EmptyState>
      </RevealSection>

      <section class="guide-band">
        <div class="head">
          <h2>吃在成都的四条经验</h2>
          <TagPill tone="cinnabar">本地人视角</TagPill>
        </div>
        <ol>
          <li v-for="(tip, i) in eatingTips" :key="i">
            <span class="index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <p>{{ tip }}</p>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
}
.list {
  margin-top: var(--space-6);
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
.guide-band {
  margin-top: var(--space-8);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.head h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  color: var(--color-text-strong);
}
.guide-band ol {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-3);
}
.guide-band li {
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
}
.index {
  font-family: var(--font-serif);
  color: var(--color-cinnabar-500);
  font-size: var(--fs-sm);
}
.guide-band p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: 1.85;
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