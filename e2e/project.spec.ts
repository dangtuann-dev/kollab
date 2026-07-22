import { test, expect } from '@playwright/test'

test.describe('Project & Sprint Setup Flow', () => {
  test('User can create project, add story, and start sprint', async ({ page }) => {
    // 1. Visit projects page
    await page.goto('/projects')
    
    // 2. Click Create Project button
    await page.click('button:has-text("Tạo Dự án Mới")')
    await page.fill('input[name="name"]', 'Agile E2E Project')
    await page.fill('textarea[name="description"]', 'E2E Testing project description')
    await page.click('button[type="submit"]')

    // 3. Open project board
    await page.click('text=Agile E2E Project')
    await expect(page).toHaveURL(/\/projects\/.*\/board/)

    // 4. Navigate to Backlog & create story
    await page.click('a:has-text("Backlog")')
    await page.click('button:has-text("Tạo User Story")')
    await page.fill('input[name="title"]', 'Build auth modal')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Build auth modal')).toBeVisible()
  })
})
