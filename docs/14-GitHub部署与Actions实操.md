# GitHub 部署与 Actions 实操手册

> 目标：把本仓库推到你的 GitHub，跑通 CI（lint/typecheck/test/build/E2E），并用 GitHub Pages 得到一个 HTTPS 线上地址，再把地址与审计结果回填到报告里。

---

## 0. 前置检查

| 项 | 要求 | 自查命令 |
| --- | --- | --- |
| Node.js | ≥ 20.19 | `node -v` |
| pnpm | 10.x | `pnpm -v` |
| Git | 任意 | `git --version` |
| 本地全绿 | lint/typecheck/test/build | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` |

> 所有命令都在 `city-web/` 目录内执行。

---

## 1. 在 GitHub 建仓库

1. 打开 https://github.com/new
2. Repository name：`chengdu-culture-web`（或任意，后续 `BASE_PATH` 要与仓库名一致）
3. 可见性：**Public**（Pages 免费版要求公开仓库；Private 需 Pro）
4. **不要**勾选 "Add a README" / ".gitignore" / "license"（本地已有，避免冲突）
5. 点 Create repository，记下页面上的地址，例如
   `https://github.com/<你的用户名>/chengdu-culture-web.git`

---

## 2. 推送本地仓库

本地 `city-web/` 已经是完整 Git 仓库（30 个提交、7 个分支、tag v1.0.0）。

```bash
cd city-web
git remote add origin https://github.com/<你的用户名>/chengdu-culture-web.git
git push -u origin main
git push origin develop
git push --tags
# 可选：把 7 个 feature 分支也推上去，PR 记录在 GitHub 上就"真"了
git push origin --all
```

首次 push 会要求登录，两种方式任选：

- **HTTPS + PAT**：GitHub → Settings → Developer settings → Personal access tokens → Tokens(classic) → 勾 `repo`，复制 token 当密码粘贴；
- **SSH**：`ssh-keygen -t ed25519 -C "你的邮箱"`，把 `~/.ssh/id_ed25519.pub` 贴到 GitHub → Settings → SSH keys，然后把 remote 换成 `git@github.com:...`。

---

## 3. 开启 Actions（CI 自动跑）

推上去后打开仓库 **Actions** 标签页：

- 首次会提示启用 workflow，点 **I understand my workflows, go ahead and enable them**；
- `CI` 会在 push 到 main/develop 或发起 PR 时自动执行：
  `pnpm install → lint → typecheck → unit test → build → artifact`，随后 `Playwright E2E`（安装 chromium 后跑 desktop-edge）；
- 点进某次运行 → 左侧 `quality` / `e2e` 两个 job，全绿即通过。

> 本地用 Edge、CI 用 Chromium：`playwright.config.ts` 通过 `PLAYWRIGHT_CHANNEL` 环境变量切换，CI 里已设为 `chromium`。

---

## 4. 部署到 GitHub Pages（得到 HTTPS 线上地址）

### 4.1 一次性设置

1. 仓库 **Settings → Pages**
2. **Build and deployment → Source** 选择 **GitHub Actions**（不要选 Deploy from a branch）
3. 同页 **Environment** 会自动出现 `github-pages`，无需改动

### 4.2 关键：子路径 base

GitHub Pages 的项目站点地址是 `https://<user>.github.io/<repo>/`，因此构建时必须带子路径，否则 JS/CSS 404。

`deploy.yml` 已经做了这件事（把仓库名作为 `BASE_PATH` 传入）：

```yaml
- run: pnpm build
  env:
    BASE_PATH: /${{ github.event.repository.name }}/
```

`vite.config.ts` 读取该变量作为 `base`。如果你的仓库名不同，无需改代码。

### 4.3 触发一次部署

- 推到 `main` 会自动触发 `Deploy to GitHub Pages`；
- 也可以在 Actions 里手动 **Run workflow**（workflow_dispatch 已开启）。

首屏若报 404：确认 `dist/404.html` 已生成（workflow 里已 `cp dist/index.html dist/404.html`），并确认 Pages Source 选的是 GitHub Actions。

### 4.4 验证清单

| 检查 | 期望 |
| --- | --- |
| 打开站点根路径 | 首页正常、样式与图片加载无 404 |
| 直接访问 `/scenic/panda` | 不 404（SPA 回退生效） |
| 浏览器地址栏 | `https://...`（HTTPS） |
| DevTools → Network | `assets/*.js` 返回 200 且带长缓存 |

---

## 5. 拿到线上地址后跑真实审计

```bash
# 把线上地址传给审计脚本（替代默认的本地 4173）
set LH_BASE=https://<user>.github.io/<repo>
node scripts/lighthouse.mjs / /scenic /food /traffic
```

PowerShell 写法：`$env:LH_BASE="https://..."`。

这次 `best-practices` 的 `is-on-https` 会满分（本地 http 环境固定失分 19 分），可以把新的四项分数替换进：

- `docs/10-测试报告.md` 第 4 节表格
- 小组报告 docx 第 7.5 节表格
- 答辩 PPT 第 12 页

---

## 6. 跨浏览器回归（不需要 GitHub）

```bash
pnpm exec playwright install firefox webkit
pnpm exec playwright test --project=desktop-firefox
pnpm exec playwright test --project=desktop-webkit
pnpm exec playwright test --project=mobile-webkit
```

三条都通过后，把结果补进 `docs/10-测试报告.md` 第 6 节兼容性表格（把"预期一致/未做自动化"改成"已通过"）。

> 说明：WebKit 覆盖 Safari 内核；桌面 Safari 与 iOS Safari 的差异主要在字体与滚动惯性，本项目未使用仅 Safari 特有的 API。

---

## 7. 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE` | 在仓库根目录执行 pnpm | `cd city-web` 后再执行 |
| Pages 打开是 404 / 白屏 | 没设 `BASE_PATH`，资源路径错 | 确认 deploy.yml 的 `BASE_PATH` 与仓库名一致 |
| 深链刷新 404 | 没有 SPA 回退 | 确认 `dist/404.html` 存在 |
| CI 里 E2E 失败：Executable doesn't exist | 没装浏览器 | workflow 已 `playwright install --with-deps chromium`；本地跑不需要 |
| CI 里 E2E 超时 | preview 未起来 | `webServer.url` 已配置，若仍超时把 `timeout` 调到 120s |
| `git push` 被拒 403 | PAT 权限不足 | 重新生成带 `repo` 权限的 token |

---

## 8. 需要我继续做的事

把下面三样发我，我来回填文档/报告/PPT：

1. 仓库地址（`https://github.com/...`）
2. 任意一次 CI 运行的链接（Actions → 某次 run）
3. 线上地址（Pages URL）与 `lighthouse-reports/summary.md` 的新数据
