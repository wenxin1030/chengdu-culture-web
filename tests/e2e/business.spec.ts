import { expect, test } from '@playwright/test'

test.describe('业务页面', () => {
  test('景区列表支持按区域筛选', async ({ page }) => {
    await page.goto('/scenic')
    const total = await page.locator('.scenic-card').count()
    expect(total).toBeGreaterThanOrEqual(2)
    await page.getByRole('button', { name: '都江堰市' }).click()
    const filtered = await page.locator('.scenic-card').count()
    expect(filtered).toBeLessThan(total)
    expect(filtered).toBeGreaterThan(0)
  })

  test('景区详情展示实用信息与推荐', async ({ page }) => {
    await page.goto('/scenic/dujiangyan')
    await expect(page.locator('h1').first()).toContainText('都江堰')
    await expect(page.getByRole('heading', { name: '核心看点' })).toBeVisible()
    await expect(page.locator('.fact-card')).toContainText('门票')
  })

  test('美食页辣度筛选生效', async ({ page }) => {
    await page.goto('/food')
    await page.getByRole('button', { name: '重辣' }).click()
    const cards = page.locator('.food-card')
    await expect(cards.first()).toBeVisible()
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('交通页展示地铁线网与换乘表', async ({ page }) => {
    await page.goto('/traffic')
    await expect(page.locator('.metro li').first()).toBeVisible()
    await expect(page.locator('table.last-mile tbody tr')).toHaveCount(7)
  })

  test('城市服务页可按分类过滤', async ({ page }) => {
    await page.goto('/service')
    const all = await page.locator('.service-card').count()
    await page.getByRole('button', { name: '政务', exact: true }).click()
    const filtered = await page.locator('.service-card').count()
    expect(filtered).toBeLessThan(all)
  })

  test('未知路由展示 404 页面', async ({ page }) => {
    await page.goto('/not-exist-page')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('巷子')
    await expect(page.getByRole('link', { name: '返回首页' })).toBeVisible()
  })
})
