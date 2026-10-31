<script setup lang="ts">
/** 全站搜索结果页：支持 URL 参数、关键词高亮与空态推荐 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '@/components/layout/PageHero.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import TagPill from '@/components/common/TagPill.vue'
import RevealSection from '@/components/common/RevealSection.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { hotKeywords, searchAll } from '@/api/search'
import { highlight } from '@/utils/search'
import type { ImgKey } from '@/types'

const route = useRoute()
const router = useRouter()

const query = ref(String(route.query.q ?? ''))
const results = computed(() => searchAll(query.value, 40))

watch(
  () => route.query.q,
  (value) => {
    query.value = String(value ?? '')
  },
)

useSeo({
  title: () => (query.value ? '搜索「' + query.value + '」' : '全站搜索'),
  description: () => '在成都文化宣传网站内搜索景区、美食、文化活动、游记攻略与城市服务。',
  keywords: () => hotKeywords.join(','),
})

function submit() {
  void router.push({ path: '/search', query: query.value.trim() ? { q: query.value.trim() } : {} })
}

function pick(keyword: string) {
  query.value = keyword
  submit()
}

function segments(text: string) {
  return highlight(text, query.value)
}

function preview(key?: ImgKey): string | undefined {
  return key ? images[key] : undefined
}
</script>

<template>
  <div class="search-view">
    <PageHero
      kicker="SEARCH"
      title="全站搜索"
      desc="输入景点、美食、活动或服务名称，结果会按相关度排序并高亮命中词。"
      :img="images.hero2"
      img-alt="搜索页背景：雪山与城市"
      :breadcrumb="[{ label: '首页', to: '/' }, { label: '全站搜索' }]"
    />

    <div class="container page">
      <form class="search-box" role="search" @submit.prevent="submit">
        <label class="sr-only" for="search-input">搜索关键词</label>
        <span class="ico" aria-hidden="true">⌕</span>
        <input id="search-input" v-model="query" type="search" placeholder="例如：熊猫基地、火锅、三天两夜…" />
        <button type="submit">搜索</button>
      </form>

      <div class="hot">
        <span class="hot-label">热门：</span>
        <button v-for="keyword in hotKeywords" :key="keyword" type="button" class="hot-item" @click="pick(keyword)">
          {{ keyword }}
        </button>
      </div>

      <p v-if="query.trim()" class="summary" role="status">
        关键词「<strong>{{ query }}</strong>」共找到 <strong>{{ results.length }}</strong> 条结果
      </p>

      <RevealSection v-if="results.length" class="results">
        <ul>
          <li v-for="hit in results" :key="hit.id">
            <RouterLink :to="hit.path" class="result">
              <img v-if="preview(hit.img)" :src="preview(hit.img)" :alt="hit.title" class="thumb" loading="lazy" />
              <span v-else class="thumb placeholder" aria-hidden="true">◈</span>
              <div class="text">
                <div class="title-row">
                  <h2>
                    <template v-for="(seg, i) in segments(hit.title)" :key="i">
                      <mark v-if="seg.mark">{{ seg.text }}</mark>
                      <template v-else>{{ seg.text }}</template>
                    </template>
                  </h2>
                  <TagPill tone="muted">{{ hit.type }}</TagPill>
                </div>
                <p class="sub">
                  <template v-for="(seg, i) in segments(hit.subtitle)" :key="i">
                    <mark v-if="seg.mark">{{ seg.text }}</mark>
                    <template v-else>{{ seg.text }}</template>
                  </template>
                </p>
                <ul class="tags">
                  <li v-for="tag in hit.tags.slice(0, 3)" :key="tag">{{ tag }}</li>
                </ul>
              </div>
              <span class="score">相关度 {{ hit.score.toFixed(1) }}</span>
            </RouterLink>
          </li>
        </ul>
      </RevealSection>

      <EmptyState
        v-else-if="query.trim()"
        icon="🔎"
        title="没有找到相关内容"
        :desc="'换个关键词试试，或者看看下面的热门推荐。'"
      />

      <section v-else class="suggest">
        <h2>试试这些搜索</h2>
        <div class="cards">
          <button v-for="keyword in hotKeywords" :key="keyword" type="button" class="card" @click="pick(keyword)">
            <strong>{{ keyword }}</strong>
            <small>点击查看相关结果</small>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: var(--space-6);
  padding-bottom: var(--space-8);
}
.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5em 0.5em 0.5em 1em;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.ico {
  color: var(--color-brand-600);
  font-size: 1.1rem;
}
.search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: none;
  font: inherit;
  font-size: var(--fs-md);
  color: var(--color-text);
}
.search-box button {
  border: 0;
  border-radius: 999px;
  padding: 0.55em 1.5em;
  background: var(--color-brand-600);
  color: #fff;
  font: inherit;
  cursor: pointer;
}
.hot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: var(--space-4);
}
.hot-label {
  font-size: var(--fs-sm);
  color: var(--color-text-faint);
}
.hot-item {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.2em 0.8em;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.hot-item:hover {
  border-color: var(--color-brand-300);
  color: var(--color-brand-700);
}
.summary {
  margin: var(--space-5) 0 var(--space-3);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.summary strong {
  color: var(--color-brand-700);
}
.results ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-3);
}
.result {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  text-decoration: none;
  color: inherit;
  transition:
    border-color var(--dur-sm),
    transform var(--dur-sm);
}
.result:hover {
  border-color: var(--color-brand-300);
  transform: translateY(-2px);
}
.thumb {
  width: 132px;
  height: 88px;
  object-fit: cover;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.thumb.placeholder {
  display: grid;
  place-items: center;
  background: var(--color-surface-alt);
  color: var(--color-text-faint);
  font-size: 1.4rem;
}
.text {
  flex: 1;
  min-width: 0;
}
.title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.title-row h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-text-strong);
}
mark {
  background: color-mix(in srgb, var(--color-gold-400) 55%, transparent);
  color: inherit;
  padding: 0 0.1em;
  border-radius: 2px;
}
.sub {
  margin: 0.3em 0 0.4em;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tags li {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  background: var(--color-surface-alt);
  border-radius: 999px;
  padding: 0.1em 0.6em;
}
.score {
  align-self: flex-start;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  white-space: nowrap;
}
.suggest h2 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-serif);
  font-size: 1.2rem;
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
}
.card:hover {
  border-color: var(--color-brand-300);
}
.card strong {
  color: var(--color-text-strong);
}
.card small {
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
@media (max-width: 1023px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 767px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .thumb {
    width: 84px;
    height: 64px;
  }
  .score {
    display: none;
  }
}
</style>
