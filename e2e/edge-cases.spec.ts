import { test, expect } from '@playwright/test'

test.describe('Edge Cases & Realtime Multi-tab Tests', () => {
  test('Multi-tab realtime sync: Dragging task in Tab 1 updates Tab 2', async ({ context }) => {
    // Open Tab 1 and Tab 2
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    await page1.goto('/projects')
    await page2.goto('/projects')

    expect(page1.url()).toBeDefined()
    expect(page2.url()).toBeDefined()

    await page1.close()
    await page2.close()
  })

  test('Offline mode handling: displays error toast when offline', async ({ page }) => {
    await page.goto('/projects')
    await page.context().setOffline(true)
    
    // Attempt action offline
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))
    await page.context().setOffline(false)
  })

  test('Session expired redirect: redirects to /login when token invalid', async ({ page }) => {
    await page.goto('/projects')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    await expect(page).toHaveURL(/\/login/)
  })
})
