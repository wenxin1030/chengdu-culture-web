<script setup lang="ts">
/** 文化活动列表：分类与季节筛选 + 月份时间轴 */
import { computed, ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { cultureCategories, cultureEvents } from '@/data/culture'
import { scoreMatch } from '@/utils/search'

useSeo({
  title: () => '文化活动 · 一年的热闹',
  description: () => '成都文化活动日历：春节灯会、武侯祠大庙会、川剧变脸、蜀绣非遗体验、国际音乐节与成都马拉松。',
  keywords: () => '成都活动,灯会,庙会,川剧变脸,非遗,成都马拉松,音乐节',
})

const filters = ref<Record<string, string>>({ 分类: '全部', 季节: '全部' })
const keyword = ref('')

const seasons = ['全部', '春季', '夏季', '秋季', '冬季']

const filtered = computed(() => {
  const category = filters.value['分类'] ?? '全部'
  const season = filters.value['季节'] ?? '全部'
  const q = keyword.value.trim()
  return cultureEvents
    .filter((event) => {
      if (category !== '全部' && event.category !== category) return false
      if (season !== '全部' && event.season !== season) return false
      if (!q) return true
      const { score } = scoreMatch(q, [
        { text: event.name, weight: 6 },
        { text: event.tags.join(' '), weight: 3 },
        { text: event.summary, weight: 2 },
        { text: event.place, weight: 2 },
        { text: event.intro, weight: 1 },
      ])
      return score > 0
    })
    .sort((a, b) => a.month - b.month)
})

function reset() {
  filters.value = { 分类: '全部', 季节: '全部' }
  keyword.value = ''
}

const months = computed(() => {
  const map = new Map<number, number>()
  for (const event of cultureEvents) map.set(event.month, (map.get(event.month) ?? 0) + 1)
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: map.get(i + 1) ?? 0 }))
})
const maxCount = computed(() => Math.max(1, ...months.value.map((m) => m.count)))
</script>

<template>
  <div class="culture-view">
    <PageHero
      kicker="CULTURE EVENTS"
      title="一年十二个月，&#10;成都都有热闹可赶"
      desc="灯会与大庙会开启新年，春天有糖酒会与花季，夏天赛龙舟，秋天办音乐节与非遗节，冬天泡一场温泉。"
      :img="images.cultureHero"
      img-alt="成都灯会：夜色中的彩灯"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '文化活动' }]"
    />

    <div class="container page">
      <section class="calendar" aria-label="活动月度分布">
        <h2 class="sr-only">活动月度分布</h2>
        <ul>
          <li v-for="item in months" :key="item.month">
            <span class="bar" :style="{ height: Math.max(6, (item.count / maxCount) * 64) + 'px' }"></span>
            <span class="m">{{ item.month }}月</span>
          </li>
        </ul>
      </section>

      <FilterBar
        :groups="[
          { label: '分类', options: [...cultureCategories] },
          { label: '季节', options: seasons },
        ]"
        v-model="filters"
        v-model:keyword="keyword"
        :total="filtered.length"
        placeholder="搜索活动名称、地点或标签…"
        @reset="reset"
      />

      <RevealSection class="list">
        <div v-if="filtered.length" class="grid-3">
          <EventCard v-for="(event, i) in filtered" :key="event.id" :event="event" :eager="i < 3" />
        </div>
        <EmptyState v-else title="这段时间没有匹配的活动" desc="试试切换分类或清空关键词。">
          <button type="button" class="reset" @click="reset">重置筛选</button>
        </EmptyState>
      </RevealSection>

      <aside class="note">
        <h2>观演与参节提醒</h2>
        <ul>
          <li>川剧变脸演出多在每晚 19:30-21:00，建议提前一天购票，前排中间观感最佳。</li>
          <li>春节灯会与大庙会人流密集，尽量选择工作日或 21:00 后入园。</li>
          <li>马拉松、音乐节等大型活动期间部分道路管制，请提前查看交通公告。</li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.calendar {
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.calendar ul {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: end;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  min-height: 90px;
}
.calendar li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4em;
  height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 100%;
  max-width: 26px;
  border-radius: 6px 6px 2px 2px;
  background: linear-gradient(180deg, var(--color-brand-400), var(--color-brand-600));
}
.m {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.list {
  margin-top: var(--space-2);
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
.note {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-strong);
  background: color-mix(in srgb, var(--color-brand-50) 60%, transparent);
}
.note h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: 1.1rem;
}
.note ul {
  margin: 0;
  padding-left: 1.1em;
  display: grid;
  gap: 0.5rem;
  font-size: var(--fs-sm);
  line-height: 1.8;
  color: var(--color-text-muted);
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
  .calendar ul {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>