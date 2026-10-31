import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<h1>browser ok</h1>')
console.log('chromium launch OK:', await page.textContent('h1'), '| version:', browser.version())
await browser.close()
