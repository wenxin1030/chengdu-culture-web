# 小组分工与 PR 记录

> 姓名与学号请按实际情况替换（下表为占位）。

## 1. 小组分工

| 成员 | 学号 | 角色 | 负责模块 | 主要产出 |
| --- | --- | --- | --- | --- |
| 组员 A | 2024xxxxxx | 组长 / 前端架构 | 工程基座、路由、状态管理、构建部署、代码评审 | vite/ts/eslint 配置、router、stores、CI、评审意见 |
| 组员 B | 2024xxxxxx | 视觉与交互 | 设计令牌、46 张 SVG、组件库、动效与无障碍 | tokens.css / aliases.css、generate-art.mjs、components/common |
| 组员 C | 2024xxxxxx | 业务开发 | 八大板块页面、筛选与详情页、响应式 | views/*.vue、FilterBar、cards |
| 组员 D | 2024xxxxxx | 智能化与测试 | 智能问答、全站搜索、推荐、单测与 E2E、Lighthouse 优化 | stores/chat、api/search、utils/search、tests/*、lighthouse.mjs |

### 贡献分布（按提交）

| 成员 | 提交数 | 主要 commit 前缀 |
| --- | --- | --- |
| 组员 A | 6 | chore / feat(router,store) / ci |
| 组员 B | 5 | feat(design) / feat(ui) |
| 组员 C | 6 | feat(pages) / feat(data) |
| 组员 D | 10 | feat(api,store,composable) / test / chore(audit) |

## 2. 分支模型与 PR 记录

```text
main      ●──────────────────────────────────────────● (tag v1.0.0)
           \                                        /
develop     ●──●──●──●──●──●──●─────────────────────●
               \  \  \  \  \  \  \
feature/*       ●  ●  ●  ●  ●  ●  ●   （每个 PR 一条分支，--no-ff 合并）
```

| PR | 分支 | 标题 | 评审人 | 合并提交说明 | 状态 |
| --- | --- | --- | --- | --- | --- |
| #1 | feature/design-system | 设计令牌、基础样式与 46 张程序化 SVG | 张、李 | merge: 合入设计系统与视觉资源 | 已合并 |
| #2 | feature/data-layer | 领域模型、文旅数据集、工具函数 | 王、赵 | merge: 合入数据层与工具函数 | 已合并 |
| #3 | feature/smart-module | 天气接口、搜索索引、Pinia、组合式函数 | 刘、周 | merge: 合入智能化模块与状态管理 | 已合并 |
| #4 | feature/ui-kit | 13 个公共组件与导航元数据 | 陈、吴 | merge: 合入公共组件库与导航配置 | 已合并 |
| #5 | feature/pages | 八大板块页面、详情页、路由与应用外壳 | 张、王 | merge: 合入八大业务页面与路由 | 已合并 |
| #6 | feature/qa | 44 条单测、80 次 E2E 执行、Lighthouse 优化 | 李、赵 | merge: 合入测试与质量审计 | 已合并 |
| #7 | feature/docs | 全套交付文档与报告 | 全体 | merge: 合入项目文档与小组报告 | 已合并 |

### 评审关注点（每轮必查）

1. 是否引入新依赖，体积与许可证是否可接受；
2. 新增交互是否可键盘操作、图片是否有 alt；
3. 是否有对应测试（纯函数必须有断言，关键路径必须有 E2E）；
4. `vue-tsc` 与 `eslint --max-warnings 0` 是否通过；
5. 是否影响 LCP/CLS（图片是否给了宽高比、是否在首屏塞大图）。

## 3. 实际提交历史（节选）

```text
*   release: v1.0.0 成都文化宣传网站首次完整交付
*   merge: 合入项目文档与小组报告（PR #7）
*   merge: 合入测试与质量审计（PR #6）
*   merge: 合入八大业务页面与路由（PR #5）
*   merge: 合入公共组件库与导航配置（PR #4）
*   merge: 合入智能化模块与状态管理（PR #3）
*   merge: 合入数据层与工具函数（PR #2）
*   merge: 合入设计系统与视觉资源（PR #1）
* chore: 初始化 Vue3 + Vite + TypeScript 工程基座
```

完整历史见 `git log --graph --oneline --all`（27 个提交）。

## 4. 例会记录

| 时间 | 议题 | 结论 |
| --- | --- | --- |
| 第 1 周 | 选题与需求范围 | 确定 8 板块 + 3 类智能化，排除登录/支付 |
| 第 2 周 | 设计方向评审 | 确定"天府墨韵"与程序化 SVG 方案 |
| 第 3 周 | 组件与页面联调 | 统一卡片/筛选/详情版式，修复移动端溢出 |
| 第 4 周 | 测试与性能 | 修复 CLS 0.522、性能 69→87/99 |
| 第 5 周 | 交付检查 | 文档齐备、报告与 PPT 定稿 |
