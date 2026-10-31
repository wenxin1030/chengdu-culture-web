<script setup lang="ts">
/** 城市服务：一站式服务入口 + 分类筛选 + 服务热线 */
import { computed, ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import ServiceCard from '@/components/cards/ServiceCard.vue'
import WeatherWidget from '@/components/common/WeatherWidget.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import ChatAssistant from '@/components/common/ChatAssistant.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { cityServices, hotlines, serviceCategories } from '@/data/services'

useSeo({
  title: () => '城市服务 · 出行文旅政务一站通',
  description: () => '成都城市服务入口：天府通、地铁、双机场、景区预约、博物馆、政务办事、12345 热线与医疗服务。',
  keywords: () => '成都服务,天府通,成都地铁,景区预约,12345,成都政务',
})

const active = ref<string>('全部')
const filtered = computed(() =>
  active.value === '全部' ? cityServices : cityServices.filter((s) => s.category === active.value),
)

const quickFacts = [
  { label: '覆盖服务', value: cityServices.length + ' 类' },
  { label: '官方入口', value: '均为政府或景区官方渠道' },
  { label: '更新时间', value: '2026 年 10 月' },
]
</script>

<template>
  <div class="service-view">
    <PageHero
      kicker="CITY SERVICES"
      title="城市服务，&#10;一个页面找到入口"
      desc="出行、文旅、政务与生活服务，把散落在各个官方渠道的入口整理到一处，少走弯路。"
      :img="images.serviceHero"
      img-alt="城市服务主题图：现代城市天际线"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '城市服务' }]"
    />

    <div class="container page">
      <div class="filter-row" role="group" aria-label="服务分类">
        <button
          v-for="category in serviceCategories"
          :key="category"
          type="button"
          class="chip"
          :class="{ 'is-active': active === category }"
          :aria-pressed="active === category"
          @click="active = category"
        >
          {{ category }}
        </button>
        <span class="count">共 {{ filtered.length }} 项服务</span>
      </div>

      <RevealSection class="grid-wrap">
        <div class="grid-4">
          <ServiceCard v-for="service in filtered" :key="service.id" :service="service" />
        </div>
      </RevealSection>

      <RevealSection class="panels">
        <div class="panel">
          <SectionHeading kicker="HOTLINES" title="常用服务热线" desc="遇到紧急情况或需要咨询时，可直接拨号。" />
          <ul class="hotlines">
            <li v-for="line in hotlines" :key="line.label">
              <span class="name">{{ line.label }}</span>
              <a :href="'tel:' + line.number" class="number">{{ line.number }}</a>
              <span class="desc">{{ line.desc }}</span>
            </li>
          </ul>
        </div>

        <div class="panel">
          <SectionHeading kicker="TODAY" title="今日天气与出行" desc="出发前先看一眼天气，再决定穿什么、带不带伞。" />
          <WeatherWidget variant="card" />
          <ul class="quick">
            <li v-for="fact in quickFacts" :key="fact.label">
              <strong>{{ fact.label }}</strong>
              <span>{{ fact.value }}</span>
            </li>
          </ul>
        </div>
      </RevealSection>

      <RevealSection class="assistant-block">
        <SectionHeading
          kicker="AI ASSISTANT"
          title="不确定该找哪个入口？直接问"
          desc="锦官小助手整理了景点预约、交通、紧急求助等常见问题。"
        />
        <ChatAssistant inline />
      </RevealSection>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}
.chip {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.35em 1em;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.chip.is-active {
  background: var(--color-brand-600);
  border-color: var(--color-brand-600);
  color: #fff;
}
.count {
  margin-left: auto;
  font-size: var(--fs-sm);
  color: var(--color-text-faint);
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.panels {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--space-6);
  margin-top: var(--space-8);
}
.panel {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.hotlines {
  display: grid;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.hotlines li {
  min-width: 0;
  display: grid;
  grid-template-columns: 7em auto 1fr;
  align-items: baseline;
  gap: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px dashed var(--color-border);
  font-size: var(--fs-sm);
}
.name {
  color: var(--color-text-strong);
  font-weight: 500;
  overflow-wrap: anywhere;
}
.number {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  color: var(--color-cinnabar-600);
  text-decoration: none;
  letter-spacing: 0.04em;
}
.number:hover {
  text-decoration: underline;
}
.desc {
  color: var(--color-text-faint);
  font-size: var(--fs-xs);
}
.quick {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--fs-sm);
}
.quick li {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-muted);
}
.quick strong {
  color: var(--color-text-strong);
  font-weight: 500;
}
.assistant-block {
  margin-top: var(--space-8);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-brand-50) 60%, transparent);
}
@media (max-width: 1023px) {
  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  .panels {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 767px) {
  .grid-4 {
    grid-template-columns: 1fr;
  }
  .hotlines li {
    grid-template-columns: 1fr auto;
  }
  .desc {
    grid-column: 1 / -1;
  }
}
</style>