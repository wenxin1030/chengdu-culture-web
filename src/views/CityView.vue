<script setup lang="ts">
/** 城市介绍：历史时间轴 + 地理文化分栏 + 城市数据 */
import RevealSection from '@/components/common/RevealSection.vue'
import SectionHeading from '@/components/common/SectionHeading.vue'
import StatCounter from '@/components/common/StatCounter.vue'
import SmartImage from '@/components/common/SmartImage.vue'
import TagPill from '@/components/common/TagPill.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { useSeo } from '@/composables/useSeo'
import { images } from '@/assets/images'
import { citySections, cityStats, cityTraits, timeline } from '@/data/city'

useSeo({
  title: () => '城市介绍 · 三千年城名未改',
  description: () => '成都城市介绍：从开明王朝迁都、李冰筑都江堰，到金沙太阳神鸟与天府国际机场，一条时间轴读懂天府之国。',
  keywords: () => '成都历史,天府之国,都江堰,金沙遗址,交子,成都地理,蓉城',
})
</script>

<template>
  <div class="city-view">
    <PageHero
      kicker="ABOUT CHENGDU"
      title="三千年城名未改，&#10;一座活着的天府"
      desc="成都，简称「蓉」，别称锦官城、芙蓉城。它的城市轴线三千年未移，城名两千余年未改——这在中国城市史上极为罕见。"
      :img="images.cityHero"
      img-alt="成都历史意象：晨雾中的川西林盘与远山"
    />

    <section class="stats-band">
      <div class="container">
        <ul>
          <li v-for="stat in cityStats" :key="stat.label">
            <StatCounter :value="stat.value" :suffix="stat.suffix" :unit="stat.unit" :label="stat.label" />
          </li>
        </ul>
      </div>
    </section>

    <!-- 时间轴 -->
    <RevealSection class="section">
      <div class="container">
        <SectionHeading
          kicker="TIMELINE"
          title="一条时间轴，读懂成都"
          desc="从古蜀开明王朝到双国际机场，十个节点勾勒这座城市的关键转折。"
        />
        <ol class="timeline">
          <li v-for="(node, index) in timeline" :key="node.year" :class="{ 'is-right': index % 2 === 1 }">
            <div class="point" aria-hidden="true"></div>
            <article class="card">
              <p class="year">{{ node.year }}</p>
              <h3>{{ node.title }}</h3>
              <p class="desc">{{ node.desc }}</p>
            </article>
          </li>
        </ol>
      </div>
    </RevealSection>

    <!-- 分栏介绍 -->
    <RevealSection class="section is-alt">
      <div class="container">
        <SectionHeading kicker="CITY PROFILE" title="四个侧面，认识成都" desc="历史、地理、文化与生活，构成了这座城市的四重底色。" />
        <div class="sections">
          <article v-for="(section, index) in citySections" :key="section.id" class="profile" :class="{ 'is-reverse': index % 2 === 1 }">
            <div class="media">
              <SmartImage :src="images[section.img]" :alt="section.title" ratio="4 / 3" :eager="index === 0" />
            </div>
            <div class="copy">
              <p class="kicker">{{ section.kicker }}</p>
              <h3>{{ section.title }}</h3>
              <p v-for="(p, i) in section.paragraphs" :key="i">{{ p }}</p>
            </div>
          </article>
        </div>
      </div>
    </RevealSection>

    <!-- 城市名片 -->
    <RevealSection class="section">
      <div class="container">
        <SectionHeading kicker="NAMECARDS" title="成都的六张城市名片" desc="这些标签，是外地人记住成都的理由，也是成都人日常的生活。" />
        <ul class="namecards">
          <li v-for="trait in cityTraits" :key="trait.title">
            <span class="emoji" aria-hidden="true">{{ trait.icon }}</span>
            <div>
              <h3>{{ trait.title }}</h3>
              <p>{{ trait.desc }}</p>
            </div>
          </li>
        </ul>
        <div class="next">
          <TagPill tone="brand">下一站</TagPill>
          <RouterLink to="/scenic">去看看经典景区 →</RouterLink>
          <RouterLink to="/culture">或者赶一场文化活动 →</RouterLink>
        </div>
      </div>
    </RevealSection>
  </div>
</template>

<style scoped>
.city-view {
  padding-bottom: var(--space-8);
}
.stats-band {
  padding: var(--space-6) 0;
  border-block: 1px solid var(--color-border);
  background: var(--color-surface);
}
.stats-band ul {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.section {
  padding: var(--space-9) 0;
}
.section.is-alt {
  background: color-mix(in srgb, var(--color-brand-50) 55%, transparent);
}
/* 时间轴 */
.timeline {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--space-5);
}
.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(var(--color-brand-200), var(--color-border));
}
.timeline li {
  position: relative;
  width: calc(50% - var(--space-6));
  padding-right: var(--space-4);
  justify-self: start;
}
.timeline li.is-right {
  justify-self: end;
  padding-right: 0;
  padding-left: var(--space-4);
  text-align: left;
}
.point {
  position: absolute;
  top: 1.4rem;
  right: calc(-1 * var(--space-6) - 5px);
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-cinnabar-500);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-cinnabar-500) 18%, transparent);
}
.timeline li.is-right .point {
  right: auto;
  left: calc(-1 * var(--space-6) - 5px);
}
.card {
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.year {
  margin: 0 0 0.3em;
  font-family: var(--font-serif);
  font-size: var(--fs-sm);
  letter-spacing: 0.08em;
  color: var(--color-cinnabar-600);
}
.card h3 {
  margin: 0 0 var(--space-2);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-text-strong);
}
.desc {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.85;
  color: var(--color-text-muted);
}
/* 分栏 */
.sections {
  display: grid;
  gap: var(--space-8);
}
.profile {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: var(--space-6);
  align-items: center;
}
.profile.is-reverse {
  grid-template-columns: 1fr 1.05fr;
}
.profile.is-reverse .media {
  order: 2;
}
.media {
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.kicker {
  margin: 0 0 var(--space-2);
  font-size: var(--fs-xs);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-brand-600);
}
.copy h3 {
  margin: 0 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: clamp(1.2rem, 1rem + 0.8vw, 1.6rem);
  color: var(--color-text-strong);
}
.copy p {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-md);
  line-height: 1.95;
  color: var(--color-text-muted);
}
/* 名片 */
.namecards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.namecards li {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.emoji {
  font-size: 1.4rem;
  line-height: 1;
}
.namecards h3 {
  margin: 0 0 0.3em;
  font-family: var(--font-serif);
  font-size: 1rem;
  color: var(--color-text-strong);
}
.namecards p {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: 1.7;
  color: var(--color-text-muted);
}
.next {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px dashed var(--color-border);
  flex-wrap: wrap;
}
.next a {
  color: var(--color-brand-600);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.next a:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
@media (max-width: 1023px) {
  .stats-band ul {
    grid-template-columns: repeat(3, 1fr);
  }
  .profile,
  .profile.is-reverse {
    grid-template-columns: 1fr;
  }
  .profile.is-reverse .media {
    order: 0;
  }
  .namecards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 767px) {
  .timeline::before {
    left: 6px;
  }
  .timeline li,
  .timeline li.is-right {
    width: 100%;
    padding-left: var(--space-5);
    padding-right: 0;
    justify-self: stretch;
  }
  .point,
  .timeline li.is-right .point {
    left: 1px;
    right: auto;
  }
  .stats-band ul {
    grid-template-columns: repeat(2, 1fr);
  }
  .namecards {
    grid-template-columns: 1fr;
  }
}
</style>