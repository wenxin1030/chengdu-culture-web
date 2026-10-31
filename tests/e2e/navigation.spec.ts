import { expect, test } from '@playwright/test'

test.describe('全站搜索与智能问答', () => {
  test('搜索面板可用键盘打开并定位结果', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('/')
    const dialog = page.getByRole('dialog', { name: '全站搜索' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('searchbox').fill('熊猫基地')
    await expect(dialog.locator('.result').first()).toBeVisible()
    await expect(dialog.locator('.result').first()).toContainText('熊猫')
    await dialog.locator('.result').first().click()
    await expect(page).toHaveURL(/\/scenic\/panda/)
    await expect(page.locator('h1').first()).toContainText('熊猫')
  })

  test('搜索页按关键词过滤并高亮', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('火锅'))
    await expect(page.locator('.summary')).toContainText('火锅')
    await expect(page.locator('.result').first()).toBeVisible()
    await expect(page.locator('mark').first()).toBeVisible()
  })

  test('智能问答可回复熊猫相关问题', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /打开智能问答助手/ }).click()
    const panel = page.locator('.assistant.is-float .panel')
    await expect(panel).toBeVisible()
    await panel.getByLabel('输入你的问题').fill('熊猫基地门票多少钱')
    await panel.getByRole('button', { name: '发送' }).click()
    await expect(panel.locator('.from-bot .bubble').last()).toContainText('55', { timeout: 10_000 })
  })

  test('主题切换会写入 html data-theme', async ({ page }) => {
    await page.goto('/')
    const before = await page.locator('html').getAttribute('data-theme')
    await page.getByRole('button', { name: /主题/ }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', before ?? 'light')
  })
})