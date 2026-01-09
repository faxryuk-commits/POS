/**
 * Unit тесты для Zustand Store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from '../store/useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Сбрасываем store перед каждым тестом
    useStore.getState().resetToDemo()
    useStore.setState({ 
      cart: [], 
      transactions: [],
      isAuthenticated: false,
      currentCashier: null
    })
  })

  describe('Авторизация', () => {
    it('должен авторизовать пользователя с правильным PIN', () => {
      const result = useStore.getState().login('0000')
      
      expect(result.success).toBe(true)
      expect(result.cashier).toBeDefined()
      expect(result.cashier.name).toBe('Администратор')
      expect(useStore.getState().isAuthenticated).toBe(true)
    })

    it('не должен авторизовать с неверным PIN', () => {
      const result = useStore.getState().login('9999')
      
      expect(result.success).toBe(false)
      expect(result.cashier).toBeUndefined()
      expect(useStore.getState().isAuthenticated).toBe(false)
    })

    it('должен выходить из системы', () => {
      useStore.getState().login('0000')
      expect(useStore.getState().isAuthenticated).toBe(true)
      
      useStore.getState().logout()
      
      expect(useStore.getState().isAuthenticated).toBe(false)
      expect(useStore.getState().currentCashier).toBeNull()
      expect(useStore.getState().cart).toHaveLength(0)
    })
  })

  describe('Корзина', () => {
    const testProduct = {
      id: 1,
      name: 'Test Product',
      price: 100,
      stock: 10,
      category: 'Напитки',
      barcode: '1234567890'
    }

    it('должен добавлять товар в корзину', () => {
      useStore.getState().addToCart(testProduct)
      
      const cart = useStore.getState().cart
      expect(cart).toHaveLength(1)
      expect(cart[0].id).toBe(testProduct.id)
      expect(cart[0].quantity).toBe(1)
    })

    it('должен увеличивать количество при повторном добавлении', () => {
      useStore.getState().addToCart(testProduct)
      useStore.getState().addToCart(testProduct)
      
      const cart = useStore.getState().cart
      expect(cart).toHaveLength(1)
      expect(cart[0].quantity).toBe(2)
    })

    it('должен удалять товар из корзины', () => {
      useStore.getState().addToCart(testProduct)
      expect(useStore.getState().cart).toHaveLength(1)
      
      useStore.getState().removeFromCart(testProduct.id)
      expect(useStore.getState().cart).toHaveLength(0)
    })

    it('должен обновлять количество товара', () => {
      useStore.getState().addToCart(testProduct)
      useStore.getState().updateCartQuantity(testProduct.id, 5)
      
      expect(useStore.getState().cart[0].quantity).toBe(5)
    })

    it('должен правильно считать итого', () => {
      useStore.getState().addToCart(testProduct) // 100
      useStore.getState().addToCart(testProduct) // +100 = 200
      
      expect(useStore.getState().getCartTotal()).toBe(200)
    })

    it('должен очищать корзину', () => {
      useStore.getState().addToCart(testProduct)
      useStore.getState().clearCart()
      
      expect(useStore.getState().cart).toHaveLength(0)
    })
  })

  describe('Товары', () => {
    it('должен искать товар по штрих-коду', () => {
      const product = useStore.getState().findProductByBarcode('4600000000001')
      
      expect(product).toBeDefined()
      expect(product.name).toBe('Coca-Cola 0.5л')
    })

    it('должен возвращать undefined для несуществующего штрих-кода', () => {
      const product = useStore.getState().findProductByBarcode('0000000000000')
      
      expect(product).toBeUndefined()
    })

    it('должен добавлять новый товар', () => {
      const initialCount = useStore.getState().products.length
      
      useStore.getState().addProduct({
        name: 'Новый товар',
        price: 150,
        stock: 20,
        category: 'Напитки',
        barcode: '9999999999999'
      })
      
      expect(useStore.getState().products.length).toBe(initialCount + 1)
    })

    it('должен удалять товар', () => {
      const initialCount = useStore.getState().products.length
      const productId = useStore.getState().products[0].id
      
      useStore.getState().deleteProduct(productId)
      
      expect(useStore.getState().products.length).toBe(initialCount - 1)
    })
  })

  describe('Продажи', () => {
    beforeEach(() => {
      useStore.getState().login('0000')
    })

    it('должен создавать транзакцию при продаже', () => {
      const product = useStore.getState().products[0]
      const initialStock = product.stock
      
      useStore.getState().addToCart(product)
      const transaction = useStore.getState().completeSale('cash', 100)
      
      expect(transaction).toBeDefined()
      expect(transaction.receiptNumber).toMatch(/^R-/)
      expect(transaction.total).toBe(product.price)
      expect(transaction.paymentMethod).toBe('cash')
    })

    it('должен уменьшать остаток после продажи', () => {
      const product = useStore.getState().products[0]
      const initialStock = product.stock
      
      useStore.getState().addToCart(product)
      useStore.getState().completeSale('card')
      
      const updatedProduct = useStore.getState().products.find(p => p.id === product.id)
      expect(updatedProduct.stock).toBe(initialStock - 1)
    })

    it('должен очищать корзину после продажи', () => {
      useStore.getState().addToCart(useStore.getState().products[0])
      useStore.getState().completeSale('cash')
      
      expect(useStore.getState().cart).toHaveLength(0)
    })
  })

  describe('Склад', () => {
    it('должен добавлять приход товара', () => {
      const product = useStore.getState().products[0]
      const initialStock = product.stock
      
      useStore.getState().addStockMovement({
        productId: product.id,
        productName: product.name,
        type: 'incoming',
        quantity: 10,
        comment: 'Тестовый приход'
      })
      
      const updatedProduct = useStore.getState().products.find(p => p.id === product.id)
      expect(updatedProduct.stock).toBe(initialStock + 10)
      expect(useStore.getState().stockMovements).toHaveLength(1)
    })

    it('должен списывать товар', () => {
      const product = useStore.getState().products[0]
      const initialStock = product.stock
      
      useStore.getState().addStockMovement({
        productId: product.id,
        productName: product.name,
        type: 'outgoing',
        quantity: 5,
        comment: 'Тестовое списание'
      })
      
      const updatedProduct = useStore.getState().products.find(p => p.id === product.id)
      expect(updatedProduct.stock).toBe(initialStock - 5)
    })
  })

  describe('Валюта', () => {
    it('должен возвращать символ валюты', () => {
      const symbol = useStore.getState().getCurrencySymbol()
      expect(symbol).toBeDefined()
      expect(typeof symbol).toBe('string')
    })

    it('должен возвращать объект валюты', () => {
      const currency = useStore.getState().getCurrency()
      
      expect(currency).toBeDefined()
      expect(currency.code).toBeDefined()
      expect(currency.symbol).toBeDefined()
      expect(currency.name).toBeDefined()
      expect(currency.flag).toBeDefined()
    })

    it('должен менять валюту в настройках', () => {
      useStore.getState().updateSettings({ currency: 'USD' })
      
      expect(useStore.getState().settings.currency).toBe('USD')
      expect(useStore.getState().getCurrency().symbol).toBe('$')
    })
  })

  describe('Статистика', () => {
    it('должен возвращать статистику за сегодня', () => {
      const stats = useStore.getState().getTodayStats()
      
      expect(stats).toBeDefined()
      expect(typeof stats.salesCount).toBe('number')
      expect(typeof stats.revenue).toBe('number')
      expect(typeof stats.itemsSold).toBe('number')
      expect(typeof stats.averageCheck).toBe('number')
    })

    it('должен возвращать статистику за неделю', () => {
      const stats = useStore.getState().getWeekStats()
      
      expect(Array.isArray(stats)).toBe(true)
      expect(stats.length).toBe(7)
    })
  })
})
