<script setup lang="ts">
/** 404 页面：友好提示 + 常用入口 */
import { useSeo } from '@/composables/useSeo'
import { navItems } from '@/router/nav'

useSeo({ title: () => '页面未找到', description: () => '你访问的页面不存在，返回首页继续浏览成都的内容。' })
</script>

<template>
  <div class="not-found">
    <div class="container inner">
      <p class="code" aria-hidden="true">404</p>
      <h1>这条巷子走不通了</h1>
      <p class="desc">你访问的页面可能已被移动或删除。不妨从下面这些栏目重新出发。</p>
      <div class="actions">
        <RouterLink to="/" class="btn primary">返回首页</RouterLink>
        <RouterLink to="/search" class="btn">全站搜索</RouterLink>
      </div>
      <ul class="links">
        <li v-for="item in navItems" :key="item.path">
          <RouterLink :to="item.path">
            <span aria-hidden="true">{{ item.icon }}</span>{{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  padding: var(--space-10) 0;
  background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-brand-100) 70%, transparent), transparent 60%);
}
.inner {
  text-align: center;
  max-width: 720px;
}
.code {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(4rem, 3rem + 8vw, 8rem);
  line-height: 1;
  color: color-mix(in srgb, var(--color-brand-600) 26%, transparent);
  letter-spacing: 0.1em;
}
h1 {
  margin: var(--space-3) 0 var(--space-3);
  font-family: var(--font-serif);
  font-size: clamp(1.4rem, 1.1rem + 1.4vw, 2rem);
  color: var(--color-text-strong);
}
.desc {
  margin: 0 0 var(--space-5);
  color: var(--color-text-muted);
}
.actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.btn {
  padding: 0.6em 1.5em;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.btn.primary {
  background: var(--color-brand-600);
  border-color: var(--color-brand-600);
  color: #fff;
}
.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.links a {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.4em 0.9em;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--fs-sm);
}
.links a:hover {
  border-color: var(--color-brand-300);
  color: var(--color-brand-700);
}
</style>
