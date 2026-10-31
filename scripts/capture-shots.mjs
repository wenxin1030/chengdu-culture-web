import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

mkdirSync('.preview/shots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })

const overflow = []
const pages = ['/', '/city', '/scenic', '/scenic/dujiangyan', '/food', '/culture', '/guides', '/service', '/traffic', '/search?q=' + encodeURIComponent('火锅'), '/not-exist']

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
for (const url of pages) {
  await desktop.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' })
  const w = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow.push(url + ' desktop overflow=' + w)
}
const shots = [
  ['/', 'home-hero'],
  ['/#scenic', 'home-scenic'],
  ['/city', 'city'],
  ['/scenic', 'scenic'],
  ['/scenic/dujiangyan', 'scenic-detail'],
  ['/food', 'food'],
  ['/culture', 'culture'],
  ['/traffic', 'traffic'],
]
for (const [url, name] of shots) {
  await desktop.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' })
  await desktop.waitForTimeout(600)
  await desktop.screenshot({ path: '.preview/shots/' + name + '.png' })
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true })
for (const url of pages) {
  await mobile.goto('http://127.0.0.1:4173' + url, { waitUntil: 'networkidle' })
  const w = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  overflow.push(url + ' mobile overflow=' + w)
}
await mobile.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await mobile.screenshot({ path: '.preview/shots/home-mobile.png' })

// 深色主题
const dark = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
await dark.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await dark.evaluate(() => localStorage.setItem('cd-theme', 'dark'))
await dark.reload({ waitUntil: 'networkidle' })
await dark.waitForTimeout(500)
await dark.screenshot({ path: '.preview/shots/home-dark.png' })

console.log(overflow.join('\n'))
await browser.close()
