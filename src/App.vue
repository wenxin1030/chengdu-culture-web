<script setup lang="ts">
/** 应用外壳：页眉 + 路由视图 + 页脚 + 悬浮智能助手 */
import { onMounted, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ChatAssistant from '@/components/common/ChatAssistant.vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const showTop = ref(false)

function onScroll() {
  showTop.value = window.scrollY > 700
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div id="top" class="app-shell">
    <AppHeader />

    <main id="main" tabindex="-1">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter />

    <button v-show="showTop" type="button" class="to-top" aria-label="回到顶部" @click="toTop">↑</button>
    <ChatAssistant v-if="app.ready" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
main {
  flex: 1;
  /* 路由分包加载期间先占满一屏，避免页脚在首屏内跳动（CLS） */
  min-height: calc(100dvh - var(--header-h));
  outline: none;
}
.to-top {
  position: fixed;
  right: clamp(1rem, 2vw, 2rem);
  bottom: calc(clamp(1rem, 2vw, 2rem) + 64px);
  z-index: var(--z-float);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-brand-700);
  cursor: pointer;
  box-shadow: var(--shadow-md);
}
.page-enter-active,
.page-leave-active {
  transition:
    opacity var(--dur-md) var(--ease-out),
    transform var(--dur-md) var(--ease-out);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-from,
  .page-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>