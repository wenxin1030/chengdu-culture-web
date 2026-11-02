import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

mkdirSync('docs/screenshots', { recursive: true })
const shots = [["/","prod-home-hero",0],["/","prod-home-sections",980],["/city","prod-city",0],["/culture","prod-culture",0],["/scenic","prod-scenic",0],["/scenic/panda","prod-detail",0],["/guides","prod-guides",0],["/food","prod-food",0],["/service","prod-service",0],["/traffic","prod-traffic",0]]
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
for (const [url, name, scroll] of shots) {
  await page.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' })
  if (scroll) await page.evaluate((y) => window.scrollTo(0, y), scroll)
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'docs/screenshots/' + name + '.png' })
  const title = await page.title()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(name, '|', title.slice(0, 32), '| overflow:', overflow)
}
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true })
for (const [url, name] of [['/', 'prod-home-mobile'], ['/food', 'prod-food-mobile']]) {
  await mobile.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(500)
  await mobile.screenshot({ path: 'docs/screenshots/' + name + '.png' })
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(name, '| overflow:', overflow)
}
await browser.close()
