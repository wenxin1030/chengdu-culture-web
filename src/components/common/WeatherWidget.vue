<script setup lang="ts">
/**
 * 实时天气组件（页眉与首页共用）
 * 数据来源：open-meteo 公共接口（见 src/api/weather.ts），失败时自动降级为示例数据。
 * variant=pill 为页眉紧凑态，card 为首页展开态。
 */
import { computed } from 'vue'
import { useWeather } from '@/composables/useWeather'
import { WEATHER_GLYPHS, glyphOf } from '@/utils/weatherGlyph'

const props = withDefaults(defineProps<{ variant?: 'pill' | 'card' }>(), { variant: 'pill' })
const { store, temperature, text, icon, tip, updatedAt, isOnline } = useWeather()

const glyph = computed(() => WEATHER_GLYPHS[icon.value] ?? '☁')
const loading = computed(() => store.loading && !store.weather)
</script>

<template>
  <div v-if="props.variant === 'pill'" class="weather-pill">
    <button
      type="button"
      class="pill-inner"
      :aria-label="'成都实时天气：' + text + ' ' + temperature + '，点击刷新'"
      :title="tip + (isOnline ? '' : '（示例数据）')"
      @click="store.refresh()"
    >
      <span class="glyph" aria-hidden="true">{{ loading ? '⏳' : glyph }}</span>
      <span class="temp">{{ loading ? '--' : temperature }}</span>
      <span class="text">{{ loading ? '加载中' : text }}</span>
    </button>
  </div>

  <div v-else class="weather-card">
    <div class="head">
      <div>
        <p class="city">{{ store.weather?.city ?? '成都' }} · 实时天气</p>
        <p class="main">
          <span class="glyph big" aria-hidden="true">{{ glyph }}</span>
          <span class="temp big">{{ temperature }}</span>
          <span class="text big">{{ text }}</span>
        </p>
      </div>
      <div class="meta">
        <p>体感 {{ store.weather?.apparent ?? '--' }}° / 湿度 {{ store.weather?.humidity ?? '--' }}%</p>
        <p>风速 {{ store.weather?.wind ?? '--' }} m/s</p>
        <p class="updated">
          {{ isOnline ? '数据更新于 ' + updatedAt : '示例数据 · 网络不可用' }}
        </p>
      </div>
    </div>

    <p class="tip">{{ tip }}</p>

    <ul class="hourly" aria-label="未来 8 小时气温">
      <li v-for="hour in store.weather?.hourly ?? []" :key="hour.time">
        <span class="h-time">{{ hour.time }}</span>
        <span class="h-glyph" aria-hidden="true">{{ glyphOf(hour.code) }}</span>
        <span class="h-temp">{{ Math.round(hour.temperature) }}°</span>
      </li>
    </ul>

    <ul class="daily" aria-label="未来 5 天预报">
      <li v-for="day in store.weather?.daily ?? []" :key="day.date">
        <span class="d-date">{{ day.date }}</span>
        <span class="d-glyph" aria-hidden="true">{{ glyphOf(day.icon) }}</span>
        <span class="d-text">{{ day.text }}</span>
        <span class="d-temp">{{ day.min }}° / {{ day.max }}°</span>
      </li>
    </ul>

    <button type="button" class="refresh" @click="store.refresh()">
      {{ store.loading ? '刷新中…' : '刷新天气' }}
    </button>
  </div>
</template>

<style scoped>
.weather-pill .pill-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.35em 0.8em;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: border-color var(--dur-sm);
}
.pill-inner:hover {
  border-color: var(--color-brand-300);
}
.glyph {
  font-size: 1.05em;
  line-height: 1;
}
.temp {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-brand-700);
}
.text {
  color: var(--color-text-muted);
}
.weather-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: linear-gradient(150deg, var(--color-surface) 0%, var(--color-brand-50) 100%);
}
.head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.city {
  margin: 0 0 var(--space-2);
  font-size: var(--fs-sm);
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}
.main {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.4em;
}
.glyph.big {
  font-size: 2rem;
}
.temp.big {
  font-size: 2.4rem;
  font-family: var(--font-serif);
}
.text.big {
  font-size: var(--fs-lg);
  color: var(--color-text);
}
.meta p {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.updated {
  margin-top: var(--space-2);
  color: var(--color-text-faint);
  font-size: var(--fs-xs);
}
.tip {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-gold-500) 14%, transparent);
  color: var(--color-gold-700);
  font-size: var(--fs-sm);
}
.hourly {
  min-width: 0;
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  scrollbar-width: thin;
}
.hourly li {
  flex: 0 0 auto;
  min-width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
  padding: 0.5em 0.4em;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}
.h-temp {
  color: var(--color-text-strong);
  font-weight: 600;
}
.daily {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.daily li {
  display: grid;
  grid-template-columns: 3.4rem 1.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}
.d-temp {
  color: var(--color-text-strong);
  font-variant-numeric: tabular-nums;
}
.refresh {
  align-self: flex-start;
  padding: 0.45em 1em;
  border-radius: 999px;
  border: 1px solid var(--color-brand-300);
  background: transparent;
  color: var(--color-brand-700);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.refresh:hover {
  background: var(--color-brand-50);
}
</style>