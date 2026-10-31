/** 主导航配置：页眉、抽屉、页脚、边栏导航共用同一份数据 */
export interface NavItem {
  path: string
  label: string
  icon: string
  desc: string
}

export const navItems: NavItem[] = [
  { path: '/', label: '宣传主页', icon: '🏯', desc: '天府成都 · 城市名片' },
  { path: '/city', label: '城市介绍', icon: '📜', desc: '三千年城名未改' },
  { path: '/culture', label: '文化活动', icon: '🎭', desc: '节庆 · 演出 · 展览' },
  { path: '/scenic', label: '经典景区', icon: '⛰️', desc: '十大必游目的地' },
  { path: '/guides', label: '游记攻略', icon: '🧭', desc: '真实路线与预算' },
  { path: '/food', label: '特色美食', icon: '🍲', desc: '世界美食之都' },
  { path: '/service', label: '城市服务', icon: '🛎️', desc: '出行 · 文旅 · 政务' },
  { path: '/traffic', label: '交通路线', icon: '🚇', desc: '两场三站一张网' },
]
