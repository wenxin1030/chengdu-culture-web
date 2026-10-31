import { expect, test } from '@playwright/test'

test.describe('移动端关键路径', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('移动端可用抽屉导航进入栏目', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '打开导航菜单' }).click()
    const drawer = page.getByRole('navigation', { name: '移动端导航' })
    await expect(drawer).toBeVisible()
    await drawer.getByRole('link', { name: /经典景区/ }).click()
    await expect(page).toHaveURL(/\/scenic/)
    await expect(page.locator('.scenic-card').first()).toBeVisible()
  })

  test('移动端不出现横向滚动', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(2)
  })
})
