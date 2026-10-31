<script setup lang="ts">
/** 交通路线：对外交通、地铁线网、景点最后一公里换乘表 */
import { computed, ref } from 'vue'
import PageHero from '@/components/layout/PageHero.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { lastMile, metroLines, trafficRoutes } from '@/data/traffic'

useSeo({
  title: () => '交通路线 · 两场三站一张网',
  description: () => '成都交通指南：双流与天府双机场、成都东站与南站、地铁线网、公交与自驾，含景点最近地铁换乘表。',
  keywords: () => '成都交通,天府机场,双流机场,成都地铁,成都东站,换乘',
})

const activeType = ref<string>('全部')
const types = ['全部', '航空', '铁路', '地铁', '公交', '自驾']

const routes = computed(() =>
  activeType.value === '全部' ? trafficRoutes : trafficRoutes.filter((r) => r.type === activeType.value),
)

const hubs = [
  { name: '天府国际机场 TFU', note: '地铁 18 号线直达火车南站，约 40 分钟', icon: '✈️' },
  { name: '双流国际机场 CTU', note: '地铁 10 号线衔接 3 / 7 号线，约 30 分钟', icon: '🛫' },
  { name: '成都东站', note: '地铁 2 / 7 号线，高铁与动车主要枢纽', icon: '🚄' },
  { name: '成都南站', note: '地铁 1 / 7 / 18 号线，机场线换乘点', icon: '🚉' },
  { name: '成都站（火车北站）', note: '地铁 1 / 7 号线，普速列车为主', icon: '🚂' },
]
</script>

<template>
  <div class="traffic-view">
    <PageHero
      kicker="GETTING AROUND"
      title="两场三站一张网，&#10;去哪都顺"
      desc="成都拥有双国际枢纽机场与密集的地铁线网。先搞清楚怎么进市区，再决定怎么去景区。"
      :img="images.trafficHero"
      img-alt="交通主题图：城市道路与轨道"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '交通路线' }]"
    />

    <div class="container page">
      <!-- 交通枢纽 -->
      <RevealSection>
        <SectionHeading kicker="HUBS" title="五个主要交通枢纽" desc="落地或到站后，先认准这几个名字。" />
        <ul class="hubs">
          <li v-for="hub in hubs" :key="hub.name">
            <span class="icon" aria-hidden="true">{{ hub.icon }}</span>
            <div>
              <strong>{{ hub.name }}</strong>
              <p>{{ hub.note }}</p>
            </div>
          </li>
        </ul>
      </RevealSection>

      <!-- 出行方式 -->
      <RevealSection>
        <SectionHeading kicker="WAYS TO GO" title="五种出行方式" desc="按时间、预算与行李多少选择最合适的一种。" />
        <div class="filter-row" role="group" aria-label="出行方式筛选">
          <button
            v-for="type in types"
            :key="type"
            type="button"
            class="chip"
            :class="{ 'is-active': activeType === type }"
            :aria-pressed="activeType === type"
            @click="activeType = type"
          >
            {{ type }}
          </button>
        </div>

        <div v-if="routes.length" class="route-grid">
          <article v-for="route in routes" :key="route.id" class="route">
            <header>
              <span class="r-icon" aria-hidden="true">{{ route.icon }}</span>
              <div>
                <h3>{{ route.name }}</h3>
                <small>{{ route.type }}</small>
              </div>
            </header>
            <p class="r-desc">{{ route.desc }}</p>
            <dl>
              <div>
                <dt>耗时</dt>
                <dd>{{ route.duration }}</dd>
              </div>
              <div>
                <dt>费用</dt>
                <dd>{{ route.price }}</dd>
              </div>
            </dl>
            <p class="r-detail">{{ route.detail }}</p>
          </article>
        </div>
        <EmptyState v-else title="暂无该方式的路线" desc="换一种出行方式看看。" />
      </RevealSection>

      <!-- 地铁线网 -->
      <RevealSection>
        <SectionHeading kicker="METRO" title="地铁线网速览" desc="票价 2-10 元按里程计价，支持天府通、App 二维码与银联闪付。" />
        <ul class="metro">
          <li v-for="line in metroLines" :key="line.id">
            <span class="line-badge" :style="{ background: line.color }">{{ line.name }}</span>
            <div class="line-body">
              <p class="stations">{{ line.stations.join(' · ') }}</p>
              <p class="hours">运营时间：{{ line.hours }}</p>
            </div>
          </li>
        </ul>
      </RevealSection>

      <!-- 最后一公里 -->
      <RevealSection>
        <SectionHeading kicker="LAST MILE" title="景点最后一公里" desc="从最近的地铁站到景区门口，通常还需一段步行或接驳。" />
        <div class="table-wrap">
          <table class="last-mile">
            <caption class="sr-only">主要景点最近地铁站换乘表</caption>
            <thead>
              <tr>
                <th scope="col">景点</th>
                <th scope="col">最近地铁站</th>
                <th scope="col">出站后</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in lastMile" :key="row.spot">
                <th scope="row">{{ row.spot }}</th>
                <td>{{ row.station }}</td>
                <td>{{ row.walk }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </RevealSection>

      <RevealSection class="tips">
        <h2>出行提醒</h2>
        <ul>
          <li>天府机场与双流机场之间中转，请预留 3 小时以上（含市区穿行时间）。</li>
          <li>工作日 7:30-9:00、17:30-19:00 为地铁高峰，携带大件行李建议错峰。</li>
          <li>都江堰、青城山可通过地铁 2 号线至犀浦站换乘城际铁路，比大巴更准点。</li>
          <li>景区周边停车位紧张，自驾建议停在商圈停车场再换乘地铁。</li>
        </ul>
      </RevealSection>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}
.hubs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.hubs li {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.icon {
  font-size: 1.3rem;
  line-height: 1;
}
.hubs strong {
  display: block;
  font-size: var(--fs-sm);
  color: var(--color-text-strong);
  margin-bottom: 0.3em;
}
.hubs p {
  margin: 0;
  font-size: var(--fs-xs);
  line-height: 1.7;
  color: var(--color-text-muted);
}
.filter-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}
.chip {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.3em 0.95em;
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
.route-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.route {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.route header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.r-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-brand-50);
  font-size: 1.1rem;
}
.route h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-strong);
}
.route small {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.r-desc {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.75;
  color: var(--color-text-muted);
}
.route dl {
  display: flex;
  gap: var(--space-4);
  margin: 0;
  padding: var(--space-2) 0;
  border-block: 1px dashed var(--color-border);
}
.route dt {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.route dd {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-strong);
}
.r-detail {
  margin: 0;
  font-size: var(--fs-xs);
  line-height: 1.8;
  color: var(--color-text-muted);
}
.metro {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.metro li {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.line-badge {
  flex: 0 0 auto;
  align-self: flex-start;
  display: inline-grid;
  place-items: center;
  min-width: 52px;
  padding: 0.2em 0.5em;
  border-radius: 6px;
  color: #fff;
  font-size: var(--fs-xs);
  font-weight: 600;
}
.line-body {
  min-width: 0;
}
.stations {
  margin: 0 0 0.3em;
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--color-text);
}
.hours {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.last-mile {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
}
.last-mile th,
.last-mile td {
  padding: 0.75em 1em;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}
.last-mile thead th {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: var(--fs-xs);
  letter-spacing: 0.06em;
}
.last-mile tbody th {
  font-weight: 500;
  color: var(--color-text-strong);
  white-space: nowrap;
}
.last-mile td {
  color: var(--color-text-muted);
}
.last-mile tbody tr:last-child th,
.last-mile tbody tr:last-child td {
  border-bottom: 0;
}
.tips {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-strong);
  background: color-mix(in srgb, var(--color-brand-50) 55%, transparent);
}
.tips h2 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: 1.1rem;
}
.tips ul {
  margin: 0;
  padding-left: 1.1em;
  display: grid;
  gap: 0.5rem;
  font-size: var(--fs-sm);
  line-height: 1.8;
  color: var(--color-text-muted);
}
@media (max-width: 1023px) {
  .hubs {
    grid-template-columns: repeat(2, 1fr);
  }
  .route-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .metro {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 767px) {
  .hubs,
  .route-grid {
    grid-template-columns: 1fr;
  }
}
</style>