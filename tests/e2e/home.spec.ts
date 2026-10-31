import { expect, test } from '@playwright/test'

test.describe('宣传主页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('首屏展示主视觉、导航与实时天气', async ({ page }) => {
    await expect(page.locator('.carousel h1').first()).toContainText('天府')
    // 桌面端显示主导航，移动端收起为汉堡菜单
    const nav = page.getByRole('navigation', { name: '主导航' })
    const burger = page.getByRole('button', { name: '打开导航菜单' })
    await expect(nav.or(burger)).toBeVisible()
    // 页眉辅助功能区：实时天气胶囊
    await expect(page.locator('.weather-pill')).toBeVisible()
  })

  test('八个栏目均可跳转', async ({ page }) => {
    const routes = ['/city', '/culture', '/scenic', '/guides', '/food', '/service', '/traffic']
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('h1').first()).toBeVisible()
      await expect(page).toHaveTitle(/成都/)
    }
  })

  test('城市数据与精选景区可见', async ({ page }) => {
    await expect(page.locator('.stats-section')).toBeVisible()
    await expect(page.locator('#scenic .scenic-card').first()).toBeVisible()
  })

  test('页脚展示服务热线与栏目', async ({ page }) => {
    const footer = page.locator('footer.site-footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByRole('link', { name: '12345' })).toHaveAttribute('href', 'tel:12345')
  })
})