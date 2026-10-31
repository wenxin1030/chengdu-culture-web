import type { CityService } from '@/types'

/** 城市服务入口（链接指向官方站点，仅作导览，不收集任何用户信息） */
export const cityServices: CityService[] = [
  {
    id: 'tianfu-tong',
    name: '天府通 · 交通卡',
    desc: '公交、地铁、有轨电车一卡通行，支持手机 NFC 与二维码。',
    icon: 'card',
    category: '出行',
    link: 'https://www.tianfutong.com/',
    badge: '常用',
  },
  {
    id: 'metro',
    name: '成都地铁',
    desc: '线路图、首末班时刻、票价查询与实时拥挤度。',
    icon: 'metro',
    category: '出行',
    link: 'https://www.chengdurail.com/',
    badge: '实时',
  },
  {
    id: 'airport',
    name: '双流 / 天府机场',
    desc: '航班动态、值机、机场大巴与两场中转指引。',
    icon: 'plane',
    category: '出行',
    link: 'https://www.cdairport.com/',
  },
  {
    id: 'ticket',
    name: '景区预约',
    desc: '熊猫基地、都江堰、青城山等热门景区实名预约入口。',
    icon: 'ticket',
    category: '文旅',
    link: 'https://www.cdwhly.com/',
    badge: '需预约',
  },
  {
    id: 'museum',
    name: '博物馆之城',
    desc: '成都博物馆、金沙、武侯祠等场馆预约与展讯汇总。',
    icon: 'museum',
    category: '文旅',
    link: 'https://www.cdmuseum.com/',
  },
  {
    id: 'art',
    name: '成都文化云',
    desc: '演出、展览、讲座与公益活动的一站式文化服务平台。',
    icon: 'stage',
    category: '文旅',
    link: 'https://www.cdwhyc.com/',
  },
  {
    id: 'gov',
    name: '成都市人民政府',
    desc: '政务公开、政策查询与在线办事大厅。',
    icon: 'gov',
    category: '政务',
    link: 'https://www.chengdu.gov.cn/',
  },
  {
    id: '12345',
    name: '12345 市民热线',
    desc: '城市治理、旅游投诉与紧急求助的统一入口。',
    icon: 'phone',
    category: '政务',
    link: 'https://www.chengdu.gov.cn/',
    badge: '7×24',
  },
  {
    id: 'weather',
    name: '成都气象',
    desc: '逐小时预报、空气质量与汛期预警。',
    icon: 'weather',
    category: '生活',
    link: 'https://www.cdqx.com/',
    badge: '实时',
  },
  {
    id: 'hospital',
    name: '就医服务',
    desc: '华西医院等三甲医院预约挂号与急诊指引。',
    icon: 'hospital',
    category: '生活',
    link: 'https://www.cd120.com/',
  },
  {
    id: 'payment',
    name: '文旅消费券',
    desc: '景区门票、演出票务与酒店住宿的惠民补贴入口。',
    icon: 'gift',
    category: '生活',
    link: 'https://www.cdwhly.com/',
  },
  {
    id: 'volunteer',
    name: '文旅志愿服务',
    desc: '景区讲解、文明引导与外语志愿者的报名通道。',
    icon: 'heart',
    category: '文旅',
    link: 'https://www.cdwhly.com/',
  },
]

export const serviceCategories = ['全部', '出行', '文旅', '政务', '生活'] as const

/** 首页与页脚展示的紧急电话 */
export const hotlines = [
  { label: '报警', number: '110' },
  { label: '急救', number: '120' },
  { label: '火警', number: '119' },
  { label: '旅游投诉', number: '12345' },
  { label: '地铁服务', number: '028-61638000' },
]
