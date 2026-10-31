<script setup lang="ts">
/** 经典景区列表：按区域与主题筛选 + 关键词模糊匹配 */
import { computed, ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import ScenicCard from '@/components/cards/ScenicCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { scenicFilters, scenicSpots } from '@/data/scenic'
import { scoreMatch } from '@/utils/search'

useSeo({
  title: () => '经典景区 · 十大必游目的地',
  description: () => '成都经典景区：都江堰、青城山、武侯祠、宽窄巷子、熊猫基地、锦里、杜甫草堂、金沙遗址、西岭雪山、太古里。',
  keywords: () => '成都景区,都江堰,青城山,武侯祠,熊猫基地,宽窄巷子,西岭雪山,金沙遗址',
})

const filters = ref<Record<string, string>>({ 区域: '全部', 主题: '全部' })
const keyword = ref('')

const filtered = computed(() => {
  const area = filters.value['区域'] ?? '全部'
  const tag = filters.value['主题'] ?? '全部'
  const q = keyword.value.trim()
  return scenicSpots.filter((spot) => {
    if (area !== '全部' && spot.area !== area) return false
    if (tag !== '全部' && !spot.tags.includes(tag)) return false
    if (!q) return true
    const { score } = scoreMatch(q, [
      { text: spot.name, weight: 6 },
      { text: spot.enName, weight: 2 },
      { text: spot.tags.join(' '), weight: 3 },
      { text: spot.summary, weight: 2 },
      { text: spot.intro, weight: 1 },
      { text: spot.area, weight: 1 },
    ])
    return score > 0
  })
})

function reset() {
  filters.value = { 区域: '全部', 主题: '全部' }
  keyword.value = ''
}
</script>

<template>
  <div class="scenic-view">
    <PageHero
      kicker="SCENIC SPOTS"
      title="十大经典景区，&#10;一步一景入画来"
      desc="从两千年的水利奇迹，到竹林深处的国宝、红墙下的竹影——成都的景区，是可以慢慢走、慢慢看的。"
      :img="images.scenicJinLi"
      img-alt="锦里古街夜色：灯笼与青瓦"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '经典景区' }]"
    />

    <div class="container page">
      <FilterBar
        :groups="[
          { label: '区域', options: scenicFilters.areas },
          { label: '主题', options: scenicFilters.tags },
        ]"
        v-model="filters"
        v-model:keyword="keyword"
        :total="filtered.length"
        placeholder="搜索景区名称、看点或区域…"
        @reset="reset"
      />

      <RevealSection class="list">
        <div v-if="filtered.length" class="grid-3">
          <ScenicCard v-for="(spot, i) in filtered" :key="spot.id" :scenic="spot" :eager="i < 3" />
        </div>
        <EmptyState v-else title="没有符合条件的景区" desc="试试切换区域或清空关键词。">
          <button type="button" class="reset" @click="reset">重置筛选</button>
        </EmptyState>
      </RevealSection>

      <aside class="tips">
        <h2>游玩提示</h2>
        <ul>
          <li>热门景区（熊猫基地、都江堰、青城山、武侯祠、金沙遗址）均需提前实名预约。</li>
          <li>熊猫基地建议开园即到，上午是熊猫最活跃的时段。</li>
          <li>都江堰与青城山可安排一日联游，地铁 2 号线犀浦站换乘城际铁路最方便。</li>
          <li>景区内多石阶与坡道，建议穿防滑鞋；夏季注意防晒与补水。</li>
        </ul>
      </aside>
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
.tips {
  margin-top: var(--space-7);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-strong);
  background: color-mix(in srgb, var(--color-gold-500) 8%, transparent);
}
.tips h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-text-strong);
}
.tips ul {
  margin: 0;
  padding-left: 1.1em;
  display: grid;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: 1.8;
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