// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh state
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('should show PIN login screen', async ({ page }) => {
    // Check for PIN input screen - use heading for exact match
    await expect(page.getByRole('heading', { name: 'POS System' })).toBeVisible()
    await expect(page.getByText('Введите PIN-код')).toBeVisible()
    
    // Check for keypad (numbers 1-9)
    for (let i = 1; i <= 9; i++) {
      await expect(page.getByRole('button', { name: `Цифра ${i}` })).toBeVisible()
    }
    
    // Check for 0 and delete
    await expect(page.getByRole('button', { name: 'Цифра 0' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Удалить/i })).toBeVisible()
  })

  test('should login with admin PIN using demo button', async ({ page }) => {
    // Click admin demo button
    await page.getByRole('button', { name: /Администратор.*0000/i }).click()
    
    // Wait for navigation to POS screen
    await expect(page.getByRole('heading', { name: 'Корзина' })).toBeVisible({ timeout: 5000 })
    
    // Close onboarding if shown
    const closeBtn = page.locator('[aria-label="Закрыть"]').first()
    if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await closeBtn.click()
    }
    
    // Check for admin name
    await expect(page.getByText('Администратор')).toBeVisible()
  })

  test('should login with manual PIN entry', async ({ page }) => {
    // Enter PIN manually: 0000
    await page.getByRole('button', { name: 'Цифра 0' }).click()
    await page.getByRole('button', { name: 'Цифра 0' }).click()
    await page.getByRole('button', { name: 'Цифра 0' }).click()
    await page.getByRole('button', { name: 'Цифра 0' }).click()
    
    // Login happens automatically when 4 digits entered
    // Wait for navigation to POS screen
    await expect(page.getByRole('heading', { name: 'Корзина' })).toBeVisible({ timeout: 5000 })
  })

  test('should show error for wrong PIN', async ({ page }) => {
    // Enter wrong PIN: 9999
    await page.getByRole('button', { name: 'Цифра 9' }).click()
    await page.getByRole('button', { name: 'Цифра 9' }).click()
    await page.getByRole('button', { name: 'Цифра 9' }).click()
    await page.getByRole('button', { name: 'Цифра 9' }).click()
    
    // Should show error message
    await expect(page.getByText('Неверный PIN-код')).toBeVisible({ timeout: 3000 })
    
    // Should still be on login screen
    await expect(page.getByText('Введите PIN-код')).toBeVisible()
  })

  test('should delete PIN digits', async ({ page }) => {
    // Enter some digits
    await page.getByRole('button', { name: 'Цифра 1' }).click()
    await page.getByRole('button', { name: 'Цифра 2' }).click()
    
    // Delete one
    await page.getByRole('button', { name: /Удалить/i }).click()
    
    // Check the PIN indicator - we should still be on login screen
    await expect(page.getByText('Введите PIN-код')).toBeVisible()
  })

  test('should login with cashier PIN', async ({ page }) => {
    // Click cashier demo button
    await page.getByRole('button', { name: /Кассир 1.*1234/i }).click()
    
    // Wait for navigation to POS screen
    await expect(page.getByRole('heading', { name: 'Корзина' })).toBeVisible({ timeout: 5000 })
    
    // Check for cashier name in header
    await expect(page.getByText('Кассир 1')).toBeVisible()
  })
})
