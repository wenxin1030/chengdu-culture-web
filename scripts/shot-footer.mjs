import { chromium } from '@playwright/test'
const out = 'docs/screenshots'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
const footer = page.locator('footer.site-footer')
await footer.scrollIntoViewIfNeeded()
await page.waitForTimeout(600)
await footer.screenshot({ path: out + '/footer.png' })
console.log('FOOTER TEXT >>>')
console.log(await footer.innerText())
await browser.close()