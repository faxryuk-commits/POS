/**
 * Unit Tests for useStore
 * Тесты для Zustand store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from '../../store/useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.resetToDemo()
      result.current.clearCart()
    })
  })

  describe('Authentication', () => {
    it('should start as not authenticated', () => {
      const { result } = renderHook(() => useStore())
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.currentCashier).toBe(null)
    })

    it('should login with valid admin PIN', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const loginResult = result.current.login('0000')
        expect(loginResult.success).toBe(true)
        expect(loginResult.cashier.name).toBe('Администратор')
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.currentCashier.role).toBe('admin')
    })

    it('should login with valid cashier PIN', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const loginResult = result.current.login('1234')
        expect(loginResult.success).toBe(true)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.currentCashier.name).toBe('Кассир 1')
    })

    it('should fail login with invalid PIN', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        const loginResult = result.current.login('9999')
        expect(loginResult.success).toBe(false)
      })
      
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should logout correctly', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.login('0000')
      })
      expect(result.current.isAuthenticated).toBe(true)
      
      act(() => {
        result.current.logout()
      })
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.currentCashier).toBe(null)
    })
  })

  describe('Products', () => {
    it('should have demo products', () => {
      const { result } = renderHook(() => useStore())
      expect(result.current.products.length).toBeGreaterThan(0)
    })

    it('should add a new product', () => {
      const { result } = renderHook(() => useStore())
      const initialCount = result.current.products.length
      
      act(() => {
        result.current.addProduct({
          name: 'Test Product',
          price: 100,
          stock: 10,
          category: 'Напитки',
          barcode: '1234567890'
        })
      })
      
      expect(result.current.products.length).toBe(initialCount + 1)
      expect(result.current.products.some(p => p.name === 'Test Product')).toBe(true)
    })

    it('should update a product', () => {
      const { result } = renderHook(() => useStore())
      const productId = result.current.products[0].id
      
      act(() => {
        result.current.updateProduct(productId, { name: 'Updated Name' })
      })
      
      const updated = result.current.products.find(p => p.id === productId)
      expect(updated.name).toBe('Updated Name')
    })

    it('should delete a product', () => {
      const { result } = renderHook(() => useStore())
      const productId = result.current.products[0].id
      const initialCount = result.current.products.length
      
      act(() => {
        result.current.deleteProduct(productId)
      })
      
      expect(result.current.products.length).toBe(initialCount - 1)
      expect(result.current.products.find(p => p.id === productId)).toBeUndefined()
    })

    it('should find product by barcode', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      
      const found = result.current.findProductByBarcode(product.barcode)
      expect(found).toBeDefined()
      expect(found.id).toBe(product.id)
    })

    it('should search products', () => {
      const { result } = renderHook(() => useStore())
      
      const results = result.current.searchProducts('Coca')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toContain('Coca')
    })
  })

  describe('Cart', () => {
    it('should start with empty cart', () => {
      const { result } = renderHook(() => useStore())
      expect(result.current.cart.length).toBe(0)
    })

    it('should add product to cart', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      
      act(() => {
        result.current.addToCart(product)
      })
      
      expect(result.current.cart.length).toBe(1)
      expect(result.current.cart[0].id).toBe(product.id)
      expect(result.current.cart[0].quantity).toBe(1)
    })

    it('should increase quantity when adding same product', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      
      act(() => {
        result.current.addToCart(product)
        result.current.addToCart(product)
      })
      
      expect(result.current.cart.length).toBe(1)
      expect(result.current.cart[0].quantity).toBe(2)
    })

    it('should update cart quantity', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      
      act(() => {
        result.current.addToCart(product)
        result.current.updateCartQuantity(product.id, 5)
      })
      
      expect(result.current.cart[0].quantity).toBe(5)
    })

    it('should handle quantity update to 0', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      
      act(() => {
        result.current.addToCart(product)
        result.current.updateCartQuantity(product.id, 0)
      })
      
      // Note: implementation might keep item with 0 quantity or remove it
      // Just verify the quantity is 0 or item is removed
      const cartItem = result.current.cart.find(i => i.id === product.id)
      if (cartItem) {
        expect(cartItem.quantity).toBe(0)
      } else {
        expect(result.current.cart.length).toBe(0)
      }
    })

    it('should remove product from cart', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      
      act(() => {
        result.current.addToCart(product)
        result.current.removeFromCart(product.id)
      })
      
      expect(result.current.cart.length).toBe(0)
    })

    it('should clear cart', () => {
      const { result } = renderHook(() => useStore())
      const product1 = result.current.products[0]
      const product2 = result.current.products[1]
      
      act(() => {
        result.current.addToCart(product1)
        result.current.addToCart(product2)
        result.current.clearCart()
      })
      
      expect(result.current.cart.length).toBe(0)
    })

    it('should calculate cart total', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0] // 89
      
      act(() => {
        result.current.addToCart(product)
        result.current.updateCartQuantity(product.id, 3)
      })
      
      expect(result.current.getCartTotal()).toBe(product.price * 3)
    })

    it('should calculate cart count', () => {
      const { result } = renderHook(() => useStore())
      const product1 = result.current.products[0]
      const product2 = result.current.products[1]
      
      act(() => {
        result.current.addToCart(product1)
        result.current.addToCart(product1)
        result.current.addToCart(product2)
      })
      
      expect(result.current.getCartCount()).toBe(3)
    })
  })

  describe('Sales', () => {
    it('should complete a sale', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0]
      const initialStock = product.stock
      
      // Login first
      act(() => {
        result.current.login('0000')
        result.current.addToCart(product)
      })
      
      let transaction
      act(() => {
        transaction = result.current.completeSale('card')
      })
      
      expect(transaction).toBeDefined()
      expect(transaction.type).toBe('sale')
      expect(transaction.paymentMethod).toBe('card')
      expect(result.current.cart.length).toBe(0)
      
      // Stock should be reduced
      const updatedProduct = result.current.products.find(p => p.id === product.id)
      expect(updatedProduct.stock).toBe(initialStock - 1)
    })

    it('should calculate change for cash payment', () => {
      const { result } = renderHook(() => useStore())
      const product = result.current.products[0] // 89
      
      act(() => {
        result.current.login('0000')
        result.current.addToCart(product)
      })
      
      let transaction
      act(() => {
        transaction = result.current.completeSale('cash', 100)
      })
      
      expect(transaction.change).toBe(100 - product.price)
    })
  })

  describe('Settings', () => {
    it('should have default settings', () => {
      const { result } = renderHook(() => useStore())
      expect(result.current.settings).toBeDefined()
      expect(result.current.settings.currency).toBeDefined()
    })

    it('should update settings', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.updateSettings({ storeName: 'New Store Name' })
      })
      
      expect(result.current.settings.storeName).toBe('New Store Name')
    })

    it('should get currency symbol', () => {
      const { result } = renderHook(() => useStore())
      const symbol = result.current.getCurrencySymbol()
      expect(symbol).toBeDefined()
      expect(typeof symbol).toBe('string')
    })
  })

  describe('Navigation', () => {
    it('should set active page', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.setActivePage('products')
      })
      
      expect(result.current.activePage).toBe('products')
    })

    it('should set selected category', () => {
      const { result } = renderHook(() => useStore())
      
      act(() => {
        result.current.setSelectedCategory('Напитки')
      })
      
      expect(result.current.selectedCategory).toBe('Напитки')
    })
  })

  describe('Cashiers', () => {
    it('should add a new cashier', () => {
      const { result } = renderHook(() => useStore())
      const initialCount = result.current.cashiers.length
      
      act(() => {
        result.current.addCashier({
          name: 'New Cashier',
          pin: '9999',
          role: 'cashier'
        })
      })
      
      expect(result.current.cashiers.length).toBe(initialCount + 1)
    })

    it('should update cashier', () => {
      const { result } = renderHook(() => useStore())
      const cashierId = result.current.cashiers[1].id // Not admin
      
      act(() => {
        result.current.updateCashier(cashierId, { name: 'Updated Cashier' })
      })
      
      const updated = result.current.cashiers.find(c => c.id === cashierId)
      expect(updated.name).toBe('Updated Cashier')
    })
  })
})
