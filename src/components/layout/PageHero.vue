<script setup lang="ts">
/** 内页顶部视觉：图片 + 标题 + 描述 + 面包屑 */
import SmartImage from '@/components/common/SmartImage.vue'

withDefaults(
  defineProps<{
    kicker?: string
    title: string
    desc?: string
    img: string
    imgAlt?: string
    breadcrumb?: { label: string; to?: string }[]
  }>(),
  { imgAlt: '' },
)
</script>

<template>
  <header class="page-hero">
    <div class="bg" aria-hidden="true">
      <SmartImage :src="img" :alt="imgAlt" ratio="21 / 7" :eager="true" :zoom="false" />
    </div>
    <div class="container inner">
      <nav v-if="breadcrumb && breadcrumb.length" class="crumbs" aria-label="面包屑">
        <ol>
          <li v-for="(crumb, index) in breadcrumb" :key="crumb.label">
            <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
            <span v-else aria-current="page">{{ crumb.label }}</span>
            <span v-if="index < breadcrumb.length - 1" class="sep" aria-hidden="true">/</span>
          </li>
        </ol>
      </nav>
      <p v-if="kicker" class="kicker">{{ kicker }}</p>
      <h1 class="title">{{ title }}</h1>
      <p v-if="desc" class="desc">{{ desc }}</p>
    </div>
  </header>
</template>

<style scoped>
.page-hero {
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
  background: var(--color-ink-900);
}
.bg {
  position: absolute;
  inset: 0;
}
.bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, rgba(9, 26, 22, 0.82) 0%, rgba(9, 26, 22, 0.55) 52%, rgba(9, 26, 22, 0.2) 100%);
}
.inner {
  position: relative;
  padding: clamp(2.5rem, 6vw, 5rem) var(--space-5);
  color: #f7f4ec;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.crumbs ol {
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin: 0 0 var(--space-2);
  padding: 0;
  list-style: none;
  font-size: var(--fs-xs);
  color: rgba(247, 244, 236, 0.66);
}
.crumbs a {
  color: inherit;
  text-decoration: none;
}
.crumbs a:hover {
  color: var(--color-gold-300);
}
.sep {
  margin-left: 0.4em;
  opacity: 0.5;
}
.kicker {
  margin: 0;
  font-size: var(--fs-xs);
  letter-spacing: 0.3em;
  color: var(--color-gold-300);
}
.title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.7rem, 1.2rem + 2.4vw, 2.9rem);
  line-height: 1.25;
  letter-spacing: 0.02em;
  white-space: pre-line;
  max-width: 16em;
}
.desc {
  margin: 0;
  max-width: 62ch;
  font-size: var(--fs-md);
  line-height: 1.9;
  color: rgba(247, 244, 236, 0.85);
}
</style>
