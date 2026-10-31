<script setup lang="ts">
/** 站点页脚：栏目导航、服务热线、关于与版权（公共组件） */
import { navItems } from '@/router/nav'
import { hotlines } from '@/data/services'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container grid">
      <div class="brand-col">
        <div class="brand">
          <span class="seal" aria-hidden="true">蓉</span>
          <div>
            <strong>天府成都</strong>
            <small>锦官城文化宣传网</small>
          </div>
        </div>
        <p class="intro">
          以「天府墨韵」为视觉主线，用一座城的山水、街巷与人情，讲述成都三千年不改名的故事。
          本站为《Web 智能化》课程小组任务作品，内容仅供学习交流。
        </p>
        <p class="badge">课程：Web 智能化 · 24 级人工智能 · 第 12 组</p>
      </div>

      <nav class="col" aria-label="页脚栏目导航">
        <h3>浏览栏目</h3>
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <RouterLink :to="item.path">{{ item.label }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="col">
        <h3>服务热线</h3>
        <ul>
          <li v-for="line in hotlines" :key="line.label">
            <span class="line-label">{{ line.label }}</span>
            <a :href="'tel:' + line.number" class="line-number">{{ line.number }}</a>
          </li>
        </ul>
      </div>

      <div class="col">
        <h3>关于本站</h3>
        <ul>
          <li><RouterLink to="/service">城市服务入口</RouterLink></li>
          <li><RouterLink to="/traffic">交通换乘指南</RouterLink></li>
          <li><RouterLink to="/guides">游记攻略合集</RouterLink></li>
          <li><a href="#main">回到顶部</a></li>
        </ul>
      </div>
    </div>

    <div class="container bottom">
      <p>© {{ year }} 天府成都 · 锦官城文化宣传网 · 课程小组任务演示站点</p>
      <p class="tech">Vue 3 + Vite + TypeScript · 图片全部为本地程序化生成 SVG</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: var(--space-10);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--color-brand-50) 70%, transparent));
}
.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: var(--space-6);
  padding-bottom: var(--space-7);
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.seal {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background: var(--color-cinnabar-500);
  color: #fff;
  font-family: var(--font-serif);
  font-weight: 700;
}
.brand strong {
  font-family: var(--font-serif);
  letter-spacing: 0.08em;
}
.brand small {
  display: block;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
  letter-spacing: 0.12em;
}
.intro {
  margin: 0 0 var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: 1.9;
  max-width: 42ch;
}
.badge {
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.col h3 {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-sm);
  letter-spacing: 0.14em;
  color: var(--color-brand-700);
  font-weight: 600;
}
.col ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}
.col a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.col a:hover {
  color: var(--color-brand-700);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.line-label {
  display: inline-block;
  width: 5em;
  color: var(--color-text-faint);
  font-size: var(--fs-sm);
}
.line-number {
  font-variant-numeric: tabular-nums;
}
.bottom {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding: var(--space-4) 0 var(--space-6);
  border-top: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  color: var(--color-text-faint);
}
.bottom p {
  margin: 0;
}
@media (max-width: 1023px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 639px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
