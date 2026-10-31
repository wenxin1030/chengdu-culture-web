# 天府成都 · 锦官城文化宣传网

> 《Web 智能化》（课程编码 100904511）第二次小组任务 —— 成都文化宣传网站设计
> 24 级人工智能专业 · 第 12 组

一个以「天府墨韵」为视觉主题的成都文化宣传网站，覆盖**宣传主页、城市介绍、文化活动、城市服务、经典景区、游记攻略、特色美食、交通路线**八个板块，并内置**智能问答、全站智能搜索、智能推荐**三类智能化能力。

![首页](https://img.shields.io/badge/Vue-3.5-42b883) ![Vite](https://img.shields.io/badge/Vite-6.4-646cff) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6) ![Tests](https://img.shields.io/badge/tests-44%20unit%20%2B%2032%20e2e-brightgreen) ![Lighthouse](https://img.shields.io/badge/Lighthouse-99%20%2F%2095%2B-success)

---

## 一、技术栈

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Vue 3.5（Composition API + `<script setup>`） | 单文件组件、响应式、`defineModel` |
| 构建 | Vite 6 + TypeScript 5.7 | 开发态毫秒级热更新，生产态 Rollup 分包 |
| 路由 | Vue Router 4（history 模式） | 14 条路由全部动态 import 懒加载 |
| 状态 | Pinia 2 | `app`（主题/收藏/搜索历史）、`weather`、`chat` |
| 样式 | 原生 CSS + 设计令牌 | 两层变量（调色板 → 语义 token → 组件别名），零 UI 框架依赖 |
| 测试 | Vitest 2 + @vue/test-utils | 44 条单元断言 |
| 端到端 | Playwright 1.64（本机 Edge） | 16 条用例 × 桌面/移动两种形态 |
| 质量 | ESLint 9（flat config）+ Prettier 3 + vue-tsc | 提交即校验 |
| 审计 | Lighthouse 12 | 性能/可访问性/最佳实践/SEO |
| 视觉资源 | 程序化生成 SVG（46 张） | 不依赖任何外部图床与字体，离线可用 |

## 二、快速开始

```bash
# 1. 安装依赖（Node.js ≥ 20.19）
pnpm install

# 2. 本地开发
pnpm dev            # http://127.0.0.1:5173

# 3. 类型检查 + 代码规范
pnpm typecheck
pnpm lint

# 4. 单元测试 / 端到端测试
pnpm test
pnpm exec playwright test          # 需要本机 Chrome 或 Edge

# 5. 生产构建与本地预览
pnpm build
pnpm preview        # http://127.0.0.1:4173

# 6. Lighthouse 审计（先启动 preview）
pnpm lighthouse
```

> 说明：本机审计使用 `channel: 'msedge'`（无需下载 Chromium）。`scripts/lighthouse.mjs` 会通过 Playwright 启动浏览器并暴露 CDP 端口，审计结果写入 `lighthouse-reports/`。

## 三、目录结构

```text
city-web/
├─ public/                     # favicon、robots.txt、sitemap.xml
├─ scripts/
│  ├─ generate-art.mjs         # 程序化生成 46 张水墨风 SVG
│  ├─ preview-art.mjs          # SVG → PNG 预览（resvg）
│  ├─ lighthouse.mjs           # 性能/可访问性审计
│  └─ capture-shots.mjs        # 关键页面截图 + 横向溢出检测
├─ src/
│  ├─ api/                     # contentApi（模拟后端）、weather（open-meteo）、search（搜索索引）
│  ├─ assets/
│  │  ├─ img/                  # 46 张 SVG
│  │  ├─ images.ts             # 资源注册表（带 hash 指纹）
│  │  └─ styles/               # tokens / aliases / base / utilities
│  ├─ components/
│  │  ├─ common/               # 卡片、轮播、天气、搜索面板、问答、筛选栏等 13 个
│  │  ├─ cards/                # 景区 / 美食 / 活动 / 攻略 / 服务卡片
│  │  └─ layout/               # 页眉、页脚、边栏导航、内页横幅
│  ├─ composables/             # useSeo / useScrollReveal / useCountUp / useGlobalSearch 等
│  ├─ data/                    # 景区×10、美食×11、活动×9、攻略×6、服务×12、交通、FAQ×16
│  ├─ router/                  # 路由表与导航元数据
│  ├─ stores/                  # Pinia：app / weather / chat
│  ├─ types/                   # 领域模型
│  ├─ utils/                   # 格式化、搜索打分、天气映射、推荐算法、SEO
│  ├─ views/                   # 14 个页面组件
│  ├─ App.vue
│  └─ main.ts
├─ tests/
│  ├─ unit/                    # 8 个 spec，44 条断言
│  └─ e2e/                     # 4 个 spec，16 条用例
├─ docs/                       # PRD、设计规范、接口、测试、部署等文档
├─ eslint.config.js
├─ vite.config.ts
└─ package.json
```

## 四、功能清单

| 板块 | 路由 | 关键能力 |
| --- | --- | --- |
| 宣传主页 | `/` | 主视觉轮播、城市数据计数动画、城市气质、精选景区/活动/美食/攻略、实时天气、内嵌智能问答、边栏导航 |
| 城市介绍 | `/city` | 历史时间轴（10 节点）、四个侧面分栏、城市名片 |
| 文化活动 | `/culture` | 月度分布图、分类/季节筛选、活动详情 |
| 经典景区 | `/scenic` | 10 个景区、区域/主题筛选、收藏、详情页（门票/交通/看点/提示） |
| 游记攻略 | `/guides` | 6 篇攻略、标签/天数筛选、人气/最新/预算排序、分段路线正文 |
| 特色美食 | `/food` | 11 种美食、辣度/场景筛选、辣度可视化、详情页推荐店铺 |
| 城市服务 | `/service` | 12 项服务入口、四类分组、服务热线、实时天气 |
| 交通路线 | `/traffic` | 5 类出行方式、7 条地铁线网、景点最后一公里换乘表 |

**智能化能力**

1. **智能问答**：15 条本地知识库 + 关键词加权匹配 + 中文二元组相似度，回答未命中时有兜底引导；支持推荐问题、打字动画、跳转详情。
2. **全站智能搜索**：标题/标签/摘要/正文四级加权，中文二元组部分召回，结果按相关度排序并高亮命中词，支持 `/` 快捷键、历史与热词。
3. **智能推荐**：标签重合度 + 季节权重 + 热度排序，在景区/美食/攻略详情页给出「猜你也想去」。

## 五、质量数据

| 指标 | 结果 |
| --- | --- |
| 单元测试 | 8 个文件 / 44 条断言，全部通过 |
| 端到端测试 | 4 个文件 / 16 条用例 × 2 形态，全部通过 |
| Lighthouse 性能（桌面） | 99（列表页）/ 87（首页） |
| Lighthouse 可访问性 | 95 ~ 100 |
| Lighthouse SEO | 100 |
| 首屏 LCP（桌面模拟） | 0.8 s ~ 2.2 s |
| CLS | 0 |
| 横向溢出（390px / 1440px） | 11 个页面均为 0 |

> 「最佳实践」为 81 分，唯一失分项是 `is-on-https`：本地以 `http://127.0.0.1` 提供预览服务，部署到 HTTPS 环境后该项即满分。

## 六、文档索引

| 文档 | 内容 |
| --- | --- |
| [需求规格说明书](docs/01-需求规格说明书.md) | 用户画像、功能/非功能需求、验收标准 |
| [可行性分析报告](docs/02-可行性分析报告.md) | 技术/经济/进度/风险可行性 |
| [竞品分析](docs/03-竞品分析.md) | 三个同类宣传网站对比与差异化策略 |
| [需求评审记录](docs/04-需求评审记录.md) | 评审会议纪要与结论 |
| [信息架构与站点地图](docs/05-信息架构与站点地图.md) | 站点地图、导航结构、任务流 |
| [线框图与高保真说明](docs/06-线框图与高保真设计说明.md) | 页面区块线框、视觉语言、资源生成 |
| [UI 设计规范](docs/07-UI设计规范.md) | 色彩/字体/间距/组件/断点/无障碍 |
| [工程化说明](docs/08-工程化说明.md) | 目录结构、规范、Git 流程、构建脚本 |
| [接口说明文档](docs/09-接口说明文档.md) | 数据接口、第三方天气、类型约定 |
| [测试报告](docs/10-测试报告.md) | 单元/E2E/审计/兼容性数据 |
| [缺陷清单](docs/11-缺陷清单.md) | 缺陷、等级、修复提交 |
| [部署与 CI 说明](docs/12-部署与CI说明.md) | 构建产物、部署方案、流水线 |
| [项目复盘报告](docs/13-项目复盘报告.md) | 目标达成、问题与改进 |
| [分工与 PR 记录](docs/分工与PR记录.md) | 成员分工、7 个 PR 记录、例会纪要 |

## 七、浏览器兼容

Chrome / Edge / Firefox / Safari 最新两个大版本。使用了 `color-mix()`、`dvh`、`aspect-ratio`、`backdrop-filter`、`clamp()` 等现代特性，均已在目标浏览器原生支持；对 `backdrop-filter` 做了降级（无该属性时仍有半透明底色）。

## 八、小组分工

| 成员 | 角色 | 主要工作 |
| --- | --- | --- |
| 组员 A（组长） | 前端架构 | 工程基座、路由与状态管理、构建与部署、代码评审 |
| 组员 B | 视觉与交互 | 设计令牌、46 张程序化 SVG、组件库、动效与无障碍 |
| 组员 C | 业务开发 | 八个板块页面、筛选与详情页、响应式适配 |
| 组员 D | 智能化与测试 | 智能问答、全站搜索、推荐算法、单元与 E2E 测试、Lighthouse 优化 |

> 姓名与学号请按实际小组情况在提交前替换（见 `docs/分工与PR记录.md`）。