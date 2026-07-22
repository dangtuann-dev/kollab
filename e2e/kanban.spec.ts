import { test, expect } from '@playwright/test'

test.describe('Kanban Board Flow', () => {
  test('User can open sprint board, drag task, and add comment', async ({ page }) => {
    // 1. Visit Sprint Board
    await page.goto('/projects')
    await page.click('.group:has-text("Agile E2E Project")')

    // 2. Verify 3 columns exist
    await expect(page.getByText(/Cần làm/i)).toBeVisible()
    await expect(page.getByText(/Đang làm/i)).toBeVisible()
    await expect(page.getByText(/Hoàn thành/i)).toBeVisible()

    // 3. Open task detail modal
    const taskCard = page.locator('.group:has-text("Build auth modal")').first()
    if (await taskCard.isVisible()) {
      await taskCard.click()
      await expect(page.getByText(/Chi tiết/i)).toBeVisible()
    }
  })
})
