/**
 * Lighthouse 性能 / 可访问性 / 最佳实践 / SEO 审计脚本
 *
 * 用法：
 *   node scripts/lighthouse.mjs                 # 审计 4 个代表页面
 *   node scripts/lighthouse.mjs / /scenic       # 指定路径
 *
 * 前置条件：
 *   1) 先启动预览服务：pnpm preview --port 4173
 *   2) 本机需有 Chrome 或 Edge，可用 CHROME_PATH 指定可执行文件
 *
 * 说明：这里直接用 --remote-debugging-port 启动浏览器，再用 CDP 端口调用 lighthouse，
 * 避免额外依赖 chrome-launcher，保证课程助教机器上零配置可跑。
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'

const BASE = process.env.LH_BASE || 'http://127.0.0.1:4173'
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/scenic', '/food', '/traffic']
const OUT_DIR = 'lighthouse-reports'
const PORT = Number(process.env.LH_PORT || 9222)
const CHANNEL = process.env.LH_CHANNEL || 'msedge'

await mkdir(OUT_DIR, { recursive: true })

/**
 * 用 Playwright 启动浏览器，并通过 --remote-debugging-port 暴露 CDP 端口给 Lighthouse。
 * 相比直接 spawn msedge，这种方式在 Windows / 无头环境下更稳定（参数由 Playwright 统一处理）。
 */
const browser = await chromium.launch({
  channel: CHANNEL,
  args: ['--remote-debugging-port=' + PORT, '--remote-debugging-address=127.0.0.1'],
})

const rows = []
try {
  for (const path of paths) {
    const url = BASE + path
    const result = await lighthouse(url, {
      port: PORT,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
      throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    })
    const { lhr, report } = result
    const score = (key) => Math.round((lhr.categories[key]?.score ?? 0) * 100)
    const name = path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-/, '')
    await writeFile(OUT_DIR + '/' + name + '.report.html', report[1])
    await writeFile(OUT_DIR + '/' + name + '.report.json', JSON.stringify(lhr, null, 2))
    const row = {
      path,
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
      lcp: lhr.audits['largest-contentful-paint']?.displayValue ?? '-',
      cls: lhr.audits['cumulative-layout-shift']?.displayValue ?? '-',
      tbt: lhr.audits['total-blocking-time']?.displayValue ?? '-',
    }
    rows.push(row)
    console.log(JSON.stringify(row))
  }
} finally {
  await browser.close()
}

const header = '| 页面 | 性能 | 可访问性 | 最佳实践 | SEO | LCP | CLS | TBT |\n| --- | --- | --- | --- | --- | --- | --- | --- |'
const body = rows
  .map((r) => '| ' + r.path + ' | ' + r.performance + ' | ' + r.accessibility + ' | ' + r.bestPractices + ' | ' + r.seo + ' | ' + r.lcp + ' | ' + r.cls + ' | ' + r.tbt + ' |')
  .join('\n')
const md = [
  '# Lighthouse 审计结果（桌面端）',
  '',
  '> 审计环境：Lighthouse 12（程序化调用 Edge headless）、桌面形态 1440×900、模拟网络 RTT 40ms / 10Mbps、CPU 无降速。',
  '> 生成方式：`pnpm preview` 后执行 `node scripts/lighthouse.mjs`。',
  '',
  header,
  body,
  '',
].join('\n')
await writeFile(OUT_DIR + '/summary.md', md)
console.log('\n' + md)