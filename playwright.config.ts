import { defineConfig, devices } from '@playwright/test'

/**
 * 端到端测试配置
 * - 默认使用本机 Microsoft Edge（channel: 'msedge'），无需下载浏览器
 * - CI（GitHub Actions）没有 Edge，通过环境变量切换为 Playwright 自带 Chromium：
 *     PLAYWRIGHT_CHANNEL=chromium pnpm exec playwright test --project=desktop-edge
 * - 跨浏览器回归：pnpm exec playwright test --project=firefox --project=webkit
 *   （需先执行 pnpm exec playwright install firefox webkit）
 * - 自动启动 vite preview 预览生产构建，覆盖真实产物而非开发服务器
 */
const channel = process.env.PLAYWRIGHT_CHANNEL || 'msedge'
const usesChannel = channel !== 'chromium' || process.env.PLAYWRIGHT_USE_CHANNEL === '1'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 6_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['github']]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },
  projects: [
    {
      name: 'desktop-edge',
      use: {
        ...devices['Desktop Chrome'],
        ...(usesChannel ? { channel } : {}),
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-edge',
      use: {
        ...devices['iPhone 13'],
        ...(usesChannel ? { channel } : {}),
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
