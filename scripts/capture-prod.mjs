import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

mkdirSync('docs/screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })

const shots = [
  ['/', 'prod-home-hero', 0],
  ['/', 'prod-home-sections', 980],
  ['/scenic', 'prod-scenic', 0],
  ['/scenic/panda', 'prod-detail', 0],
]
for (const [url, name, scroll] of shots) {
  await page.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' })
  if (scroll) await page.evaluate((y) => window.scrollTo(0, y), scroll)
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'docs/screenshots/' + name + '.png' })
  const title = await page.title()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(name, '| title:', title.slice(0, 40), '| overflow:', overflow)
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true })
await mobile.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(500)
await mobile.screenshot({ path: 'docs/screenshots/prod-home-mobile.png' })
console.log('prod-home-mobile ok')
await browser.close()
