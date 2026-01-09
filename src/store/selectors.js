/**
 * Zustand Store Selectors
 * Оптимизированные селекторы для предотвращения лишних рендеров
 */

import { useStore } from './useStore'
import { shallow } from 'zustand/shallow'
import { useMemo, useCallback } from 'react'

/**
 * Селектор для данных авторизации
 */
export const useAuthData = () => useStore(
  (state) => ({
    isAuthenticated: state.isAuthenticated,
    currentCashier: state.currentCashier,
    showPinModal: state.showPinModal,
  }),
  shallow
)

/**
 * Селектор для действий авторизации
 */
export const useAuthActions = () => useStore(
  (state) => ({
    login: state.login,
    logout: state.logout,
  }),
  shallow
)

/**
 * Селектор для настроек
 */
export const useSettings = () => useStore(
  (state) => state.settings,
  shallow
)

/**
 * Селектор для темы
 */
export const useTheme = () => useStore(
  (state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }),
  shallow
)

/**
 * Селектор для валюты
 */
export const useCurrency = () => {
  const getCurrencySymbol = useStore((state) => state.getCurrencySymbol)
  const getCurrency = useStore((state) => state.getCurrency)
  
  return useMemo(() => ({
    symbol: getCurrencySymbol(),
    currency: getCurrency(),
    formatPrice: (price) => `${price?.toLocaleString() ?? 0} ${getCurrencySymbol()}`,
  }), [getCurrencySymbol, getCurrency])
}

/**
 * Селектор для продуктов
 */
export const useProducts = () => useStore(
  (state) => state.products,
  shallow
)

/**
 * Селектор для категорий
 */
export const useCategories = () => useStore(
  (state) => state.categories,
  shallow
)

/**
 * Селектор для выбранной категории
 */
export const useSelectedCategory = () => useStore(
  (state) => ({
    selectedCategory: state.selectedCategory,
    setSelectedCategory: state.setSelectedCategory,
  }),
  shallow
)

/**
 * Селектор для фильтрованных продуктов
 */
export const useFilteredProducts = (searchQuery = '') => {
  const searchProducts = useStore((state) => state.searchProducts)
  const selectedCategory = useStore((state) => state.selectedCategory)
  
  return useMemo(() => {
    return searchProducts(searchQuery)
  }, [searchProducts, searchQuery, selectedCategory])
}

/**
 * Селектор для корзины
 */
export const useCart = () => useStore(
  (state) => ({
    cart: state.cart,
    addToCart: state.addToCart,
    removeFromCart: state.removeFromCart,
    updateCartQuantity: state.updateCartQuantity,
    clearCart: state.clearCart,
  }),
  shallow
)

/**
 * Селектор для итогов корзины
 */
export const useCartTotals = () => {
  const getCartTotal = useStore((state) => state.getCartTotal)
  const getCartCount = useStore((state) => state.getCartCount)
  const cart = useStore((state) => state.cart)
  
  return useMemo(() => ({
    total: getCartTotal(),
    count: getCartCount(),
    isEmpty: cart.length === 0,
  }), [getCartTotal, getCartCount, cart])
}

/**
 * Селектор для количества товара в корзине
 */
export const useCartItemQuantity = (productId) => {
  const cart = useStore((state) => state.cart)
  
  return useMemo(() => {
    const item = cart.find((i) => i.id === productId)
    return item?.quantity ?? 0
  }, [cart, productId])
}

/**
 * Селектор для проверки доступности товара
 */
export const useProductAvailability = () => useStore(
  (state) => ({
    isProductAvailable: state.isProductAvailable,
    getProductAvailabilityInfo: state.getProductAvailabilityInfo,
  }),
  shallow
)

/**
 * Селектор для транзакций
 */
export const useTransactions = () => useStore(
  (state) => state.transactions,
  shallow
)

/**
 * Селектор для последних транзакций (с лимитом)
 */
export const useRecentTransactions = (limit = 20) => {
  const transactions = useStore((state) => state.transactions)
  
  return useMemo(() => {
    return transactions
      .filter((t) => t.type === 'sale')
      .slice(0, limit)
  }, [transactions, limit])
}

/**
 * Селектор для статистики
 */
export const useStats = () => {
  const getTodayStats = useStore((state) => state.getTodayStats)
  const getWeekStats = useStore((state) => state.getWeekStats)
  const transactions = useStore((state) => state.transactions)
  
  return useMemo(() => ({
    today: getTodayStats(),
    week: getWeekStats(),
  }), [getTodayStats, getWeekStats, transactions])
}

/**
 * Селектор для навигации
 */
export const useNavigation = () => useStore(
  (state) => ({
    activePage: state.activePage,
    setActivePage: state.setActivePage,
  }),
  shallow
)

/**
 * Селектор для сканера
 */
export const useScanner = () => useStore(
  (state) => ({
    isScannerOpen: state.isScannerOpen,
    setScannerOpen: state.setScannerOpen,
    findProductByBarcode: state.findProductByBarcode,
  }),
  shallow
)

/**
 * Селектор для рекомендаций
 */
export const useRecommendations = () => useStore(
  (state) => ({
    getRecommendations: state.getRecommendations,
    getAvailableCombos: state.getAvailableCombos,
    getSmartRecommendations: state.getSmartRecommendations,
    getRecommendedAccessories: state.getRecommendedAccessories,
    addComboToCart: state.addComboToCart,
    addAccessoryToCart: state.addAccessoryToCart,
  }),
  shallow
)

/**
 * Селектор для кассиров
 */
export const useCashiers = () => useStore(
  (state) => ({
    cashiers: state.cashiers,
    addCashier: state.addCashier,
    updateCashier: state.updateCashier,
    deleteCashier: state.deleteCashier,
  }),
  shallow
)

/**
 * Селектор для склада
 */
export const useStock = () => useStore(
  (state) => ({
    stockMovements: state.stockMovements,
    addStockMovement: state.addStockMovement,
  }),
  shallow
)

/**
 * Селектор для продуктов с низким остатком
 */
export const useLowStockProducts = (threshold = 5) => {
  const products = useStore((state) => state.products)
  
  return useMemo(() => {
    return products.filter((p) => p.stock <= threshold && p.stock > 0)
  }, [products, threshold])
}

/**
 * Селектор для продуктов без остатка
 */
export const useOutOfStockProducts = () => {
  const products = useStore((state) => state.products)
  
  return useMemo(() => {
    return products.filter((p) => p.stock <= 0)
  }, [products])
}

/**
 * Селектор для онбординга
 */
export const useOnboarding = () => useStore(
  (state) => ({
    showOnboarding: state.showOnboarding,
    setShowOnboarding: state.setShowOnboarding,
  }),
  shallow
)

/**
 * Хук для действий с продуктами
 */
export const useProductActions = () => useStore(
  (state) => ({
    addProduct: state.addProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
  }),
  shallow
)

/**
 * Хук для завершения продажи
 */
export const useCompleteSale = () => {
  const completeSale = useStore((state) => state.completeSale)
  
  return useCallback((paymentMethod, receivedAmount) => {
    const result = completeSale(paymentMethod, receivedAmount)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    return result
  }, [completeSale])
}

/**
 * Хук для сброса данных
 */
export const useResetActions = () => useStore(
  (state) => ({
    resetToDemo: state.resetToDemo,
    clearAllData: state.clearAllData,
  }),
  shallow
)
