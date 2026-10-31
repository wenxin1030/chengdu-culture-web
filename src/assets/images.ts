/**
 * 视觉资源注册表
 * 全部为程序化生成的 SVG（见 scripts/generate-art.mjs），经 Vite 打包后带 hash 指纹，
 * 便于浏览器长期缓存，也避免任何外部图床依赖。
 */
import hero1 from './img/hero-1.svg'
import hero2 from './img/hero-2.svg'
import hero3 from './img/hero-3.svg'
import hero4 from './img/hero-4.svg'
import scenicDuJiangYan from './img/scenic-dujiangyan.svg'
import scenicQingChengShan from './img/scenic-qingchengshan.svg'
import scenicWuHouCi from './img/scenic-wuhouci.svg'
import scenicKuanZhai from './img/scenic-kuanzhai.svg'
import scenicPanda from './img/scenic-panda.svg'
import scenicJinLi from './img/scenic-jinli.svg'
import scenicDuFu from './img/scenic-dufu.svg'
import scenicJinSha from './img/scenic-jinsha.svg'
import scenicXiLing from './img/scenic-xiling.svg'
import scenicTaiKoo from './img/scenic-taikoo.svg'
import cultureDeng from './img/culture-deng.svg'
import cultureChuanJu from './img/culture-chuanju.svg'
import cultureMiaoHui from './img/culture-miaohui.svg'
import cultureTangJiu from './img/culture-tangjiu.svg'
import cultureMusic from './img/culture-music.svg'
import cultureShuXiu from './img/culture-shuxiu.svg'
import cultureLongZhou from './img/culture-longzhou.svg'
import cultureFeiYi from './img/culture-feiyi.svg'
import cultureMarathon from './img/culture-marathon.svg'
import foodHuoGuo from './img/food-huoguo.svg'
import foodChuanChuan from './img/food-chuanchuan.svg'
import foodDanDanMian from './img/food-dandanmian.svg'
import foodZhongShuiJiao from './img/food-zhongshuijiao.svg'
import foodLongChaoShou from './img/food-longchaoshou.svg'
import foodMaFu from './img/food-mafu.svg'
import foodGuoKui from './img/food-guokui.svg'
import foodTangYou from './img/food-tangyou.svg'
import foodGaiWan from './img/food-gaiwan.svg'
import foodFeiChangFen from './img/food-feichangfen.svg'
import foodBoBoJi from './img/food-boboji.svg'
import guide3Days from './img/guide-3days.svg'
import guidePanda from './img/guide-panda.svg'
import guideMuseum from './img/guide-museum.svg'
import guideNight from './img/guide-night.svg'
import guideFamily from './img/guide-family.svg'
import guideDuJiangYan from './img/guide-dujiangyan.svg'
import cityHistory from './img/city-history.svg'
import cityGeo from './img/city-geo.svg'
import cityCulture from './img/city-culture.svg'
import cityLife from './img/city-life.svg'
import serviceHero from './img/service-hero.svg'
import trafficHero from './img/traffic-hero.svg'

export const images = {
  hero1,
  hero2,
  hero3,
  hero4,
  scenicDuJiangYan,
  scenicQingChengShan,
  scenicWuHouCi,
  scenicKuanZhai,
  scenicPanda,
  scenicJinLi,
  scenicDuFu,
  scenicJinSha,
  scenicXiLing,
  scenicTaiKoo,
  cultureDeng,
  cultureChuanJu,
  cultureMiaoHui,
  cultureTangJiu,
  cultureMusic,
  cultureShuXiu,
  cultureLongZhou,
  cultureFeiYi,
  cultureMarathon,
  foodHuoGuo,
  foodChuanChuan,
  foodDanDanMian,
  foodZhongShuiJiao,
  foodLongChaoShou,
  foodMaFu,
  foodGuoKui,
  foodTangYou,
  foodGaiWan,
  foodFeiChangFen,
  foodBoBoJi,
  guide3Days,
  guidePanda,
  guideMuseum,
  guideNight,
  guideFamily,
  guideDuJiangYan,
  cityHistory,
  cityGeo,
  cityCulture,
  cityLife,
  serviceHero,
  trafficHero,
} as const

export type ImageKey = keyof typeof images
export const img = (key: ImageKey): string => images[key]
