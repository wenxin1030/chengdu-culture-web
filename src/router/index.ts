import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * 路由表：八个业务板块 + 若干详情页 + 搜索结果页 + 404
 * - 全部使用动态 import 做代码分割，首屏只加载首页 chunk
 * - meta.title 用于面包屑与文档标题兜底
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '宣传主页', board: 'home' },
  },
  {
    path: '/city',
    name: 'city',
    component: () => import('@/views/CityView.vue'),
    meta: { title: '城市介绍', board: 'city' },
  },
  {
    path: '/culture',
    name: 'culture',
    component: () => import('@/views/CultureView.vue'),
    meta: { title: '文化活动', board: 'culture' },
  },
  {
    path: '/culture/:id',
    name: 'culture-detail',
    component: () => import('@/views/CultureDetailView.vue'),
    meta: { title: '活动详情', board: 'culture' },
  },
  {
    path: '/scenic',
    name: 'scenic',
    component: () => import('@/views/ScenicView.vue'),
    meta: { title: '经典景区', board: 'scenic' },
  },
  {
    path: '/scenic/:id',
    name: 'scenic-detail',
    component: () => import('@/views/ScenicDetailView.vue'),
    meta: { title: '景区详情', board: 'scenic' },
  },
  {
    path: '/guides',
    name: 'guides',
    component: () => import('@/views/GuidesView.vue'),
    meta: { title: '游记攻略', board: 'guides' },
  },
  {
    path: '/guides/:id',
    name: 'guide-detail',
    component: () => import('@/views/GuideDetailView.vue'),
    meta: { title: '攻略详情', board: 'guides' },
  },
  {
    path: '/food',
    name: 'food',
    component: () => import('@/views/FoodView.vue'),
    meta: { title: '特色美食', board: 'food' },
  },
  {
    path: '/food/:id',
    name: 'food-detail',
    component: () => import('@/views/FoodDetailView.vue'),
    meta: { title: '美食详情', board: 'food' },
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('@/views/ServiceView.vue'),
    meta: { title: '城市服务', board: 'service' },
  },
  {
    path: '/traffic',
    name: 'traffic',
    component: () => import('@/views/TrafficView.vue'),
    meta: { title: '交通路线', board: 'traffic' },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { title: '全站搜索', board: 'search' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面未找到', board: 'home' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, top: 96, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? ''
  if (title) document.documentElement.dataset.page = to.name as string
})

export default router
