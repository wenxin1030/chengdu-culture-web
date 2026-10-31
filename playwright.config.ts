import { defineConfig, devices } from '@playwright/test'

/**
 * 端到端测试配置
 * - 使用本机已安装的 Microsoft Edge（channel: msedge），无需额外下载浏览器
 * - 自动启动 `vite preview` 预览生产构建，覆盖真实产物而非开发服务器
 * - 桌面端与移动端各跑一遍，验证响应式关键路径
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 6_000 },
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
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
      use: { ...devices['Desktop Chrome'], channel: 'msedge', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-edge',
      use: { ...devices['iPhone 13'], channel: 'msedge', defaultBrowserType: 'chromium' },
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
