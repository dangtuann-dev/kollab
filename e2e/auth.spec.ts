import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('User can register a new account, login, and access dashboard', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /Đăng nhập/i })).toBeVisible()

    // 2. Navigate to Register page
    await page.click('text=Tạo tài khoản mới')
    await expect(page).toHaveURL(/\/register/)

    // 3. Fill registration form
    await page.fill('input[type="email"]', `user_${Date.now()}@kollab.dev`)
    await page.fill('input[type="password"]', 'Password123!')
    await page.fill('input[name="full_name"]', 'Test User')
    await page.click('button[type="submit"]')

    // 4. Expect successful login or redirect to projects/dashboard
    await page.waitForURL(/\/dashboard|\/projects/)
    await expect(page.locator('header')).toBeVisible()
  })
})
