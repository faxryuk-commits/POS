// @ts-check
import { test, expect } from '@playwright/test'

// Helper to login with onboarding skipped
async function loginAsAdmin(page, isMobile = false) {
  // Click on admin demo button
  await page.getByRole('button', { name: /Администратор.*0000/i }).click()
  
  // Wait for POS screen
  if (isMobile) {
    await expect(page.locator('button').filter({ hasText: /Корзина/i })).toBeVisible({ timeout: 8000 })
  } else {
    await expect(page.getByRole('heading', { name: 'Корзина' })).toBeVisible({ timeout: 8000 })
  }
  
  // Wait a bit for any modals
  await page.waitForTimeout(300)
  
  // Check if onboarding is visible and skip it by clicking "X"
  const onboardingTitle = page.getByText('Добро пожаловать!')
  if (await onboardingTitle.isVisible({ timeout: 500 }).catch(() => false)) {
    // Find and click the close button (it's a button with just an SVG)
    // The close button is next to the "Далее" button area
    const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') })
    if (await closeButton.count() > 0) {
      await closeButton.first().click()
    } else {
      // Try clicking outside to close or press escape
      await page.keyboard.press('Escape')
    }
    await page.waitForTimeout(300)
  }
}

test.describe('POS Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Set showOnboarding to false before clearing everything
    await page.evaluate(() => {
      // Create a minimal store state that skips onboarding
      const storeData = {
        state: { showOnboarding: false },
        version: 0
      }
      localStorage.setItem('pos-store', JSON.stringify(storeData))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await loginAsAdmin(page, false)
  })

  test('should display products and categories', async ({ page }) => {
    await expect(page.getByRole('button', { name: /🏪.*Все/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /🥤.*Напитки/i })).toBeVisible()
    await expect(page.getByText('Coca-Cola 0.5л')).toBeVisible()
    await expect(page.getByText('Snickers')).toBeVisible()
  })

  test('should add product to cart', async ({ page }) => {
    await page.getByRole('button', { name: /Coca-Cola.*89/i }).first().click()
    await page.waitForTimeout(500)
    
    // Cart should show the item
    await expect(page.locator('.ios-card-grouped').filter({ hasText: 'Coca-Cola' })).toBeVisible()
  })

  test('should search products', async ({ page }) => {
    await page.getByPlaceholder('Поиск товара...').fill('Snickers')
    await page.waitForTimeout(500)
    await expect(page.getByText('Snickers')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    await page.getByRole('button', { name: /🥤.*Напитки/i }).click()
    await expect(page.getByText('Coca-Cola 0.5л')).toBeVisible()
  })

  test('should process payment', async ({ page }) => {
    // Add product
    await page.getByRole('button', { name: /Coca-Cola.*89/i }).first().click()
    await page.waitForTimeout(500)
    
    // Click pay button - more specific selector
    const payButton = page.locator('button').filter({ hasText: '💳 Оплатить' })
    await payButton.click()
    
    // Modal should open
    await expect(page.getByRole('heading', { name: 'Оплата' })).toBeVisible({ timeout: 3000 })
    
    // Pay with card
    await page.getByRole('button', { name: /Карта/i }).click()
    
    // Success
    await expect(page.getByText('Оплата принята')).toBeVisible({ timeout: 3000 })
  })
})

test.describe('POS Screen - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const storeData = {
        state: { showOnboarding: false },
        version: 0
      }
      localStorage.setItem('pos-store', JSON.stringify(storeData))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await loginAsAdmin(page, true)
  })

  test('should show mobile interface', async ({ page }) => {
    await expect(page.getByText('Coca-Cola 0.5л')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: /Корзина/i })).toBeVisible()
  })
})
