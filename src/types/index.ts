/** 全站共享的领域类型定义 */

/** 通用图片键（对应 assets/images.ts） */
export type ImgKey =
  | 'hero1' | 'hero2' | 'hero3' | 'hero4'
  | 'scenicDuJiangYan' | 'scenicQingChengShan' | 'scenicWuHouCi' | 'scenicKuanZhai' | 'scenicPanda'
  | 'scenicJinLi' | 'scenicDuFu' | 'scenicJinSha' | 'scenicXiLing' | 'scenicTaiKoo'
  | 'cultureDeng' | 'cultureChuanJu' | 'cultureMiaoHui' | 'cultureTangJiu' | 'cultureMusic'
  | 'cultureShuXiu' | 'cultureLongZhou' | 'cultureFeiYi' | 'cultureMarathon'
  | 'foodHuoGuo' | 'foodChuanChuan' | 'foodDanDanMian' | 'foodZhongShuiJiao' | 'foodLongChaoShou'
  | 'foodMaFu' | 'foodGuoKui' | 'foodTangYou' | 'foodGaiWan' | 'foodFeiChangFen' | 'foodBoBoJi'
  | 'guide3Days' | 'guidePanda' | 'guideMuseum' | 'guideNight' | 'guideFamily' | 'guideDuJiangYan'
  | 'cityHistory' | 'cityGeo' | 'cityCulture' | 'cityLife' | 'serviceHero' | 'trafficHero'

export interface ScenicSpot {
  id: string
  name: string
  enName: string
  level: string
  area: string
  img: ImgKey
  summary: string
  intro: string
  highlights: string[]
  tips: string[]
  ticket: string
  openTime: string
  duration: string
  address: string
  transport: string
  rating: number
  heat: number
  tags: string[]
  bestSeason: string
}

export interface Food {
  id: string
  name: string
  enName: string
  img: ImgKey
  summary: string
  intro: string
  price: string
  spicy: 0 | 1 | 2 | 3
  tags: string[]
  districts: string[]
  shops: string[]
  rating: number
}

export interface CultureEvent {
  id: string
  name: string
  img: ImgKey
  month: number
  season: string
  place: string
  duration: string
  price: string
  summary: string
  intro: string
  category: '节庆' | '演出' | '展览' | '赛事' | '民俗'
  tags: string[]
}

export interface Guide {
  id: string
  title: string
  subtitle: string
  author: string
  avatar: string
  date: string
  days: number
  budget: number
  season: string
  tags: string[]
  img: ImgKey
  excerpt: string
  sections: { title: string; paragraphs: string[] }[]
  likes: number
  views: number
}

export interface CityService {
  id: string
  name: string
  desc: string
  icon: string
  category: '出行' | '文旅' | '政务' | '生活'
  link: string
  badge?: string
}

export interface MetroLine {
  id: string
  name: string
  color: string
  stations: string[]
  hours: string
}

export interface TrafficRoute {
  id: string
  type: '航空' | '铁路' | '地铁' | '公交' | '自驾'
  name: string
  desc: string
  detail: string
  price: string
  duration: string
  icon: string
}

export interface TimelineNode {
  year: string
  title: string
  desc: string
}

export interface StatItem {
  label: string
  value: number
  suffix: string
  unit?: string
}

export interface FaqItem {
  id: string
  keys: string[]
  question: string
  answer: string
  tags: string[]
  link?: string
}

export interface WeatherNow {
  city: string
  temperature: number
  apparent: number
  humidity: number
  wind: number
  code: number
  text: string
  icon: string
  updatedAt: string
  source: 'online' | 'fallback'
  hourly: { time: string; temperature: number; code: number }[]
  daily: { date: string; max: number; min: number; text: string; icon: string }[]
}
