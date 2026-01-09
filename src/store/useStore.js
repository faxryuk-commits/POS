/**
 * POS System Store
 * 
 * @description Zustand store для управления состоянием POS-системы
 * Включает: товары, корзину, транзакции, авторизацию, настройки
 * 
 * @module useStore
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** @type {Object<string, Currency>} Поддерживаемые валюты СНГ */
const currencies = {
  RUB: { code: 'RUB', symbol: '₽', name: 'Российский рубль', flag: '🇷🇺' },
  UZS: { code: 'UZS', symbol: 'сўм', name: 'Узбекский сум', flag: '🇺🇿' },
  KZT: { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', flag: '🇰🇿' },
  KGS: { code: 'KGS', symbol: 'с', name: 'Кыргызский сом', flag: '🇰🇬' },
  TJS: { code: 'TJS', symbol: 'с.', name: 'Таджикский сомони', flag: '🇹🇯' },
  TMT: { code: 'TMT', symbol: 'm', name: 'Туркменский манат', flag: '🇹🇲' },
  AZN: { code: 'AZN', symbol: '₼', name: 'Азербайджанский манат', flag: '🇦🇿' },
  GEL: { code: 'GEL', symbol: '₾', name: 'Грузинский лари', flag: '🇬🇪' },
  AMD: { code: 'AMD', symbol: '֏', name: 'Армянский драм', flag: '🇦🇲' },
  BYN: { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль', flag: '🇧🇾' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Украинская гривна', flag: '🇺🇦' },
  MDL: { code: 'MDL', symbol: 'L', name: 'Молдавский лей', flag: '🇲🇩' },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США', flag: '🇺🇸' },
}

// Демо кассиры
const initialCashiers = [
  { id: 1, name: 'Администратор', pin: '0000', role: 'admin' },
  { id: 2, name: 'Кассир 1', pin: '1234', role: 'cashier' },
  { id: 3, name: 'Кассир 2', pin: '5678', role: 'cashier' },
]

// Демо данные
const initialProducts = [
  { id: 1, name: 'Coca-Cola 0.5л', price: 89, stock: 48, category: 'Напитки', barcode: '4600000000001' },
  { id: 2, name: 'Snickers', price: 65, stock: 35, category: 'Сладости', barcode: '4600000000002' },
  { id: 3, name: 'Хлеб белый', price: 45, stock: 20, category: 'Хлеб', barcode: '4600000000003' },
  { id: 4, name: 'Молоко 1л', price: 95, stock: 15, category: 'Молочные', barcode: '4600000000004' },
  { id: 5, name: 'Яблоки кг', price: 129, stock: 25, category: 'Фрукты', barcode: '4600000000005' },
  { id: 6, name: 'Сыр Российский', price: 459, stock: 8, category: 'Молочные', barcode: '4600000000006' },
  { id: 7, name: 'Чипсы Lays', price: 119, stock: 42, category: 'Снеки', barcode: '4600000000007' },
  { id: 8, name: 'Вода Aqua 1л', price: 49, stock: 60, category: 'Напитки', barcode: '4600000000008' },
  { id: 9, name: 'Шоколад Milka', price: 159, stock: 22, category: 'Сладости', barcode: '4600000000009' },
  { id: 10, name: 'Кофе 3в1', price: 35, stock: 100, category: 'Напитки', barcode: '4600000000010' },
  { id: 11, name: 'Сигареты Parliament', price: 220, stock: 50, category: 'Табак', barcode: '4600000000011' },
  { id: 12, name: 'Пиво Балтика 0.5л', price: 89, stock: 36, category: 'Алкоголь', barcode: '4600000000012' },
]

const initialCategories = ['Все', 'Напитки', 'Сладости', 'Хлеб', 'Молочные', 'Фрукты', 'Снеки', 'Табак', 'Алкоголь']

// Связи товаров для рекомендаций (часто покупают вместе)
const productPairings = {
  // Напитки + Снеки
  1: [7, 2],      // Coca-Cola -> Чипсы, Snickers
  8: [7, 2],      // Вода -> Чипсы, Snickers
  12: [7, 11],    // Пиво -> Чипсы, Сигареты
  10: [9, 2],     // Кофе -> Шоколад Milka, Snickers
  
  // Сладости + Напитки
  2: [1, 4],      // Snickers -> Coca-Cola, Молоко
  9: [10, 4],     // Milka -> Кофе, Молоко
  
  // Хлеб + Молочные
  3: [4, 6],      // Хлеб -> Молоко, Сыр
  4: [3, 6],      // Молоко -> Хлеб, Сыр
  6: [3, 4],      // Сыр -> Хлеб, Молоко
  
  // Снеки + Напитки
  7: [1, 12],     // Чипсы -> Coca-Cola, Пиво
  
  // Фрукты
  5: [4, 9],      // Яблоки -> Молоко, Шоколад
  
  // Табак/Алкоголь
  11: [12, 10],   // Сигареты -> Пиво, Кофе
}

// Апселы (более дорогие альтернативы)
const upsellOptions = {
  1: { productId: 12, reason: 'Пиво вместо колы?' },           // Coca-Cola -> Пиво
  8: { productId: 1, reason: 'Coca-Cola вместо воды?' },        // Вода -> Coca-Cola
  2: { productId: 9, reason: 'Шоколад Milka вкуснее!' },       // Snickers -> Milka
  10: { productId: 9, reason: 'Добавить шоколад к кофе?' },    // Кофе -> Milka
  4: { productId: 6, reason: 'Добавить сыр?' },                // Молоко -> Сыр
  3: { productId: 6, reason: 'Сыр к хлебу?' },                 // Хлеб -> Сыр
}

// Комбо-предложения со скидкой
const comboDeals = [
  {
    id: 'combo1',
    name: '🍔 Перекус',
    products: [1, 7],  // Coca-Cola + Чипсы
    discount: 10,      // 10% скидка
    description: 'Coca-Cola + Чипсы'
  },
  {
    id: 'combo2', 
    name: '☕ Кофе-брейк',
    products: [10, 9], // Кофе + Milka
    discount: 15,
    description: 'Кофе 3в1 + Шоколад Milka'
  },
  {
    id: 'combo3',
    name: '🍞 Завтрак',
    products: [3, 4],  // Хлеб + Молоко
    discount: 10,
    description: 'Хлеб + Молоко'
  },
  {
    id: 'combo4',
    name: '🍺 Пятница',
    products: [12, 7], // Пиво + Чипсы
    discount: 12,
    description: 'Пиво + Чипсы'
  }
]

// Аксессуары к товарам
const accessories = [
  { id: 'acc1', name: 'Пакет', price: 5, icon: '🛍️', category: 'Упаковка' },
  { id: 'acc2', name: 'Салфетки', price: 0, icon: '🧻', category: 'Посуда' },
  { id: 'acc3', name: 'Вилка', price: 0, icon: '🍴', category: 'Посуда' },
  { id: 'acc4', name: 'Ложка', price: 0, icon: '🥄', category: 'Посуда' },
  { id: 'acc5', name: 'Нож', price: 0, icon: '🔪', category: 'Посуда' },
  { id: 'acc6', name: 'Палочки', price: 0, icon: '🥢', category: 'Посуда' },
  { id: 'acc7', name: 'Зубочистки', price: 0, icon: '🪥', category: 'Посуда' },
  { id: 'acc8', name: 'Трубочка', price: 0, icon: '🥤', category: 'Посуда' },
  { id: 'acc9', name: 'Подарочная упаковка', price: 50, icon: '🎁', category: 'Упаковка' },
  { id: 'acc10', name: 'Тарелка', price: 10, icon: '🍽️', category: 'Посуда' },
  { id: 'acc11', name: 'Стакан', price: 5, icon: '🥛', category: 'Посуда' },
  { id: 'acc12', name: 'Контейнер', price: 15, icon: '📦', category: 'Упаковка' },
]

// Связи аксессуаров с категориями товаров
const categoryAccessories = {
  'Напитки': ['acc2', 'acc8', 'acc11'],
  'Сладости': ['acc2', 'acc1'],
  'Хлеб': ['acc2', 'acc1'],
  'Молочные': ['acc2', 'acc1'],
  'Фрукты': ['acc2', 'acc1', 'acc12'],
  'Снеки': ['acc2'],
  'Табак': ['acc1'],
  'Алкоголь': ['acc2', 'acc11'],
  'Суши': ['acc6', 'acc2', 'acc7'],
  'Готовая еда': ['acc3', 'acc4', 'acc5', 'acc2', 'acc10'],
}

// График доступности блюд (стоп-лист)
const initialSchedule = {
  // productId: { availableFrom: 'HH:MM', availableTo: 'HH:MM', daysOfWeek: [0-6] }
  // Пример: Пиво только после 11:00
  12: { availableFrom: '11:00', availableTo: '23:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
}

/**
 * @typedef {Object} Product
 * @property {number} id - Уникальный ID товара
 * @property {string} name - Название товара
 * @property {number} price - Цена
 * @property {number} stock - Остаток на складе
 * @property {string} category - Категория
 * @property {string} barcode - Штрих-код
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id - ID товара
 * @property {string} name - Название
 * @property {number} price - Цена
 * @property {number} quantity - Количество в корзине
 */

/**
 * @typedef {Object} Transaction
 * @property {number} id - ID транзакции
 * @property {string} receiptNumber - Номер чека
 * @property {CartItem[]} items - Товары
 * @property {number} total - Итого
 * @property {string} paymentMethod - Способ оплаты (cash/card)
 * @property {string} date - Дата ISO
 */

export const useStore = create(
  persist(
    (set, get) => ({
      /** @type {Object} Настройки магазина */
      settings: {
        currency: 'UZS',
        storeName: 'Мой магазин',
        storeAddress: '',
        taxRate: 0,
        receiptFooter: 'Спасибо за покупку!',
        theme: 'system', // 'light', 'dark', 'system'
      },
      currencies,

      // Авторизация
      isAuthenticated: false,
      currentCashier: null,
      cashiers: initialCashiers,
      showPinModal: true,

      // Товары
      products: initialProducts,
      categories: initialCategories,
      
      // Корзина
      cart: [],
      
      // Транзакции
      transactions: [],
      
      // Движения склада
      stockMovements: [],
      
      // Точки продаж / магазины
      stores: [
        { id: 1, name: 'Главный магазин', address: '', phone: '', isActive: true, isDefault: true }
      ],
      currentStore: 1,
      
      // Активная страница
      activePage: 'pos',
      
      // Показать онбординг
      showOnboarding: false,
      
      // Выбранная категория
      selectedCategory: 'Все',

      // Сканер
      isScannerOpen: false,

      // Методы настроек
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      getCurrencySymbol: () => {
        const { settings, currencies } = get()
        return currencies[settings.currency]?.symbol || '₽'
      },

      getCurrency: () => {
        const { settings, currencies } = get()
        return currencies[settings.currency] || currencies.RUB
      },

      /**
       * Авторизация по PIN-коду
       * @param {string} pin - 4-значный PIN
       * @returns {{success: boolean, cashier?: Object}} Результат авторизации
       */
      login: (pin) => {
        const { cashiers } = get()
        const cashier = cashiers.find(c => c.pin === pin)
        if (cashier) {
          set({
            isAuthenticated: true,
            currentCashier: cashier,
            showPinModal: false
          })
          return { success: true, cashier }
        }
        return { success: false }
      },

      logout: () => set({
        isAuthenticated: false,
        currentCashier: null,
        showPinModal: true,
        cart: []
      }),

      addCashier: (cashier) => set((state) => ({
        cashiers: [...state.cashiers, { ...cashier, id: Date.now() }]
      })),

      updateCashier: (id, updates) => set((state) => ({
        cashiers: state.cashiers.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      deleteCashier: (id) => set((state) => ({
        cashiers: state.cashiers.filter(c => c.id !== id)
      })),

      // ============ УПРАВЛЕНИЕ ТОЧКАМИ/МАГАЗИНАМИ ============

      /**
       * Добавить новую точку
       */
      addStore: (store) => set((state) => ({
        stores: [...state.stores, { 
          ...store, 
          id: Date.now(),
          isActive: true,
          isDefault: state.stores.length === 0
        }]
      })),

      /**
       * Обновить точку
       */
      updateStore: (id, updates) => set((state) => ({
        stores: state.stores.map(s => s.id === id ? { ...s, ...updates } : s)
      })),

      /**
       * Удалить точку
       */
      deleteStore: (id) => set((state) => {
        const filtered = state.stores.filter(s => s.id !== id)
        // Если удалили текущую точку - переключиться на первую доступную
        let newCurrentStore = state.currentStore
        if (state.currentStore === id && filtered.length > 0) {
          newCurrentStore = filtered[0].id
        }
        // Если удалили default - сделать первую default
        if (filtered.length > 0 && !filtered.some(s => s.isDefault)) {
          filtered[0].isDefault = true
        }
        return { 
          stores: filtered,
          currentStore: newCurrentStore
        }
      }),

      /**
       * Выбрать активную точку
       */
      setCurrentStore: (storeId) => set({ currentStore: storeId }),

      /**
       * Установить точку по умолчанию
       */
      setDefaultStore: (storeId) => set((state) => ({
        stores: state.stores.map(s => ({
          ...s,
          isDefault: s.id === storeId
        }))
      })),

      /**
       * Получить текущую точку
       */
      getCurrentStore: () => {
        const { stores, currentStore } = get()
        return stores.find(s => s.id === currentStore) || stores[0]
      },

      // Методы для товаров
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: product.id || Date.now() }]
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      findProductByBarcode: (barcode) => {
        const { products } = get()
        return products.find(p => p.barcode === barcode)
      },

      // Методы для корзины
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id)
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] }
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== productId)
      })),
      
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      })),
      
      clearCart: () => set({ cart: [] }),

      // Расчёт итогов
      getCartTotal: () => {
        const cart = get().cart
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
      
      getCartCount: () => {
        const cart = get().cart
        return cart.reduce((sum, item) => sum + item.quantity, 0)
      },

      /**
       * Завершение продажи
       * @param {'cash'|'card'} paymentMethod - Способ оплаты
       * @param {number|null} receivedAmount - Полученная сумма (для наличных)
       * @returns {Transaction} Созданная транзакция
       */
      completeSale: (paymentMethod, receivedAmount = null) => {
        const { cart, products, currentCashier, settings } = get()
        const total = get().getCartTotal()
        
        // Создаём транзакцию
        const transaction = {
          id: Date.now(),
          receiptNumber: `R-${Date.now().toString().slice(-8)}`,
          items: [...cart],
          total,
          paymentMethod,
          receivedAmount: receivedAmount || total,
          change: receivedAmount ? receivedAmount - total : 0,
          cashier: currentCashier?.name || 'Гость',
          cashierId: currentCashier?.id,
          currency: settings.currency,
          date: new Date().toISOString(),
          type: 'sale'
        }
        
        // Обновляем остатки
        const updatedProducts = products.map(product => {
          const cartItem = cart.find(item => item.id === product.id)
          if (cartItem) {
            return { ...product, stock: product.stock - cartItem.quantity }
          }
          return product
        })
        
        set((state) => ({
          transactions: [transaction, ...state.transactions],
          products: updatedProducts,
          cart: []
        }))
        
        return transaction
      },

      /**
       * Добавление движения склада (приход/расход)
       * @param {{productId: number, productName: string, type: 'incoming'|'outgoing', quantity: number, comment?: string}} movement
       */
      addStockMovement: (movement) => {
        const { products, currentCashier } = get()
        
        const fullMovement = {
          id: Date.now(),
          ...movement,
          cashier: currentCashier?.name || 'Система',
          date: new Date().toISOString()
        }
        
        // Обновляем остаток товара
        const updatedProducts = products.map(product => {
          if (product.id === movement.productId) {
            const newStock = movement.type === 'incoming'
              ? product.stock + movement.quantity
              : product.stock - movement.quantity
            return { ...product, stock: Math.max(0, newStock) }
          }
          return product
        })
        
        set((state) => ({
          stockMovements: [fullMovement, ...state.stockMovements],
          products: updatedProducts
        }))
      },

      // Навигация
      setActivePage: (page) => set({ activePage: page }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setScannerOpen: (isOpen) => set({ isScannerOpen: isOpen }),
      setShowOnboarding: (show) => set({ showOnboarding: show }),

      // Поиск товаров
      searchProducts: (query) => {
        const { products, selectedCategory } = get()
        let filtered = products
        
        if (selectedCategory !== 'Все') {
          filtered = filtered.filter(p => p.category === selectedCategory)
        }
        
        if (query) {
          const lower = query.toLowerCase()
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.barcode.includes(query)
          )
        }
        
        return filtered
      },

      // Статистика
      getTodayStats: () => {
        const { transactions } = get()
        const today = new Date().toDateString()
        
        const todayTransactions = transactions.filter(t =>
          new Date(t.date).toDateString() === today && t.type === 'sale'
        )
        
        return {
          salesCount: todayTransactions.length,
          revenue: todayTransactions.reduce((sum, t) => sum + t.total, 0),
          itemsSold: todayTransactions.reduce((sum, t) =>
            sum + t.items.reduce((s, i) => s + i.quantity, 0), 0
          ),
          averageCheck: todayTransactions.length > 0
            ? todayTransactions.reduce((sum, t) => sum + t.total, 0) / todayTransactions.length
            : 0
        }
      },

      getWeekStats: () => {
        const { transactions } = get()
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const weekTransactions = transactions.filter(t =>
          new Date(t.date) >= weekAgo && t.type === 'sale'
        )
        
        // Группируем по дням
        const dailyStats = {}
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const key = date.toDateString()
          dailyStats[key] = { date, revenue: 0, count: 0 }
        }
        
        weekTransactions.forEach(t => {
          const key = new Date(t.date).toDateString()
          if (dailyStats[key]) {
            dailyStats[key].revenue += t.total
            dailyStats[key].count += 1
          }
        })
        
        return Object.values(dailyStats)
      },

      // ============ РЕКОМЕНДАЦИИ И АПСЕЛЫ ============

      /**
       * Получить рекомендации на основе корзины
       * @returns {Array} Список рекомендуемых товаров
       */
      getRecommendations: () => {
        const { cart, products } = get()
        if (cart.length === 0) return []
        
        const cartIds = new Set(cart.map(item => item.id))
        const recommendations = new Map()
        
        // Собираем рекомендации для каждого товара в корзине
        cart.forEach(item => {
          const pairings = productPairings[item.id] || []
          pairings.forEach(productId => {
            if (!cartIds.has(productId)) {
              const product = products.find(p => p.id === productId)
              if (product && product.stock > 0) {
                const existing = recommendations.get(productId)
                recommendations.set(productId, {
                  ...product,
                  score: (existing?.score || 0) + 1,
                  reason: `К товару "${item.name}"`
                })
              }
            }
          })
        })
        
        // Сортируем по частоте и возвращаем топ-3
        return Array.from(recommendations.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
      },

      /**
       * Получить апсел для товара
       * @param {number} productId - ID товара
       * @returns {Object|null} Апсел предложение
       */
      getUpsell: (productId) => {
        const { products, cart } = get()
        const upsell = upsellOptions[productId]
        
        if (!upsell) return null
        
        // Проверяем что апсел товар не в корзине
        const inCart = cart.some(item => item.id === upsell.productId)
        if (inCart) return null
        
        const product = products.find(p => p.id === upsell.productId)
        if (!product || product.stock <= 0) return null
        
        return {
          product,
          reason: upsell.reason
        }
      },

      /**
       * Получить доступные комбо-предложения
       * @returns {Array} Список доступных комбо
       */
      getAvailableCombos: () => {
        const { cart, products } = get()
        const cartIds = new Set(cart.map(item => item.id))
        
        return comboDeals.map(combo => {
          // Проверяем наличие товаров
          const comboProducts = combo.products.map(id => products.find(p => p.id === id))
          const allAvailable = comboProducts.every(p => p && p.stock > 0)
          
          if (!allAvailable) return null
          
          // Считаем сколько товаров из комбо уже в корзине
          const inCartCount = combo.products.filter(id => cartIds.has(id)).length
          const missingProducts = combo.products.filter(id => !cartIds.has(id))
          
          // Если все товары уже в корзине или комбо недоступно
          if (missingProducts.length === 0) return null
          
          // Считаем цены
          const totalPrice = comboProducts.reduce((sum, p) => sum + p.price, 0)
          const discountedPrice = Math.round(totalPrice * (1 - combo.discount / 100))
          const savings = totalPrice - discountedPrice
          
          return {
            ...combo,
            products: comboProducts,
            totalPrice,
            discountedPrice,
            savings,
            inCartCount,
            missingProducts: missingProducts.map(id => products.find(p => p.id === id)),
            isPartial: inCartCount > 0 // Часть товаров уже в корзине
          }
        }).filter(Boolean)
      },

      /**
       * Добавить комбо в корзину как одну позицию
       * @param {string} comboId - ID комбо
       * @param {boolean} replaceExisting - Заменить существующие товары на комбо
       */
      addComboToCart: (comboId, replaceExisting = true) => {
        const { products, cart } = get()
        const combo = comboDeals.find(c => c.id === comboId)
        
        if (!combo) return null
        
        // Находим товары комбо
        const comboProducts = combo.products
          .map(id => products.find(p => p.id === id))
          .filter(p => p && p.stock > 0)
        
        if (comboProducts.length !== combo.products.length) return null
        
        // Считаем цену комбо со скидкой
        const totalPrice = comboProducts.reduce((sum, p) => sum + p.price, 0)
        const discountedPrice = Math.round(totalPrice * (1 - combo.discount / 100))
        
        // Добавляем комбо как одну позицию
        const comboItem = {
          id: `combo-${comboId}-${Date.now()}`,
          name: combo.name,
          price: discountedPrice,
          originalPrice: totalPrice,
          discount: combo.discount,
          quantity: 1,
          isCombo: true,
          comboId: comboId,
          includedProducts: comboProducts.map(p => ({ id: p.id, name: p.name, price: p.price })),
          category: 'Комбо'
        }
        
        // Объединяем удаление отдельных товаров и добавление комбо в одну транзакцию
        set((state) => {
          let newCart = state.cart
          
          // Если нужно заменить существующие товары
          if (replaceExisting) {
            // Удаляем товары из комбо, если они уже в корзине
            newCart = newCart.filter(item => !combo.products.includes(item.id))
          }
          
          return { cart: [...newCart, comboItem] }
        })
        
        return comboItem
      },

      /**
       * Заменить товары в корзине на комбо
       */
      convertToCombo: (comboId) => {
        const { cart, products } = get()
        const combo = comboDeals.find(c => c.id === comboId)
        
        if (!combo) return false
        
        // Проверяем что все товары комбо есть в корзине
        const allInCart = combo.products.every(productId => 
          cart.some(item => item.id === productId)
        )
        
        if (!allInCart) return false
        
        // Удаляем отдельные товары и добавляем комбо
        get().addComboToCart(comboId, true)
        return true
      },

      /**
       * Получить умные рекомендации на основе истории продаж
       * @returns {Array} Топ товаров за последнюю неделю
       */
      getSmartRecommendations: () => {
        const { transactions, products, cart } = get()
        const cartIds = new Set(cart.map(item => item.id))
        
        // Анализируем продажи за последнюю неделю
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentTransactions = transactions.filter(t => 
          new Date(t.date) >= weekAgo && t.type === 'sale'
        )
        
        // Подсчитываем частоту покупок
        const productFrequency = {}
        recentTransactions.forEach(t => {
          t.items.forEach(item => {
            productFrequency[item.id] = (productFrequency[item.id] || 0) + item.quantity
          })
        })
        
        // Возвращаем топ-3 товаров, которых нет в корзине
        return Object.entries(productFrequency)
          .map(([id, count]) => ({
            product: products.find(p => p.id === parseInt(id)),
            count
          }))
          .filter(({ product }) => product && product.stock > 0 && !cartIds.has(product.id))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map(({ product, count }) => ({
            ...product,
            reason: `Популярный товар (${count} продаж за неделю)`
          }))
      },

      // ============ АКСЕССУАРЫ ============

      accessories,
      productSchedule: initialSchedule,

      /**
       * Получить рекомендуемые аксессуары для корзины
       */
      getRecommendedAccessories: () => {
        const { cart } = get()
        const recommendedIds = new Set()
        
        cart.forEach(item => {
          const category = item.category
          const catAccessories = categoryAccessories[category]
          if (catAccessories) {
            catAccessories.forEach(id => recommendedIds.add(id))
          }
        })
        
        return accessories.filter(a => recommendedIds.has(a.id))
      },

      /**
       * Добавить аксессуар в корзину
       */
      addAccessoryToCart: (accessoryId) => {
        const accessory = accessories.find(a => a.id === accessoryId)
        if (!accessory) return
        
        set((state) => {
          const existing = state.cart.find(item => item.id === accessoryId)
          if (existing) {
            return {
              cart: state.cart.map(item =>
                item.id === accessoryId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            }
          }
          return {
            cart: [...state.cart, {
              ...accessory,
              quantity: 1,
              isAccessory: true,
              category: 'Аксессуары'
            }]
          }
        })
      },

      // ============ ГРАФИК БЛЮД (СТОП-ЛИСТ) ============

      /**
       * Проверить доступность товара по расписанию
       */
      isProductAvailable: (productId) => {
        const { productSchedule } = get()
        const schedule = productSchedule[productId]
        
        if (!schedule) return true // Нет ограничений
        
        const now = new Date()
        const currentTime = now.toTimeString().slice(0, 5)
        const currentDay = now.getDay()
        
        // Проверяем день недели
        if (!schedule.daysOfWeek.includes(currentDay)) {
          return false
        }
        
        // Проверяем время
        if (schedule.availableFrom && currentTime < schedule.availableFrom) {
          return false
        }
        if (schedule.availableTo && currentTime > schedule.availableTo) {
          return false
        }
        
        return true
      },

      /**
       * Получить информацию о недоступности товара
       */
      getProductAvailabilityInfo: (productId) => {
        const { productSchedule } = get()
        const schedule = productSchedule[productId]
        
        if (!schedule) return null
        
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        const availableDays = schedule.daysOfWeek.map(d => days[d]).join(', ')
        
        return {
          time: `${schedule.availableFrom} - ${schedule.availableTo}`,
          days: availableDays
        }
      },

      /**
       * Обновить расписание товара
       */
      updateProductSchedule: (productId, schedule) => set((state) => ({
        productSchedule: {
          ...state.productSchedule,
          [productId]: schedule
        }
      })),

      /**
       * Удалить расписание товара
       */
      removeProductSchedule: (productId) => set((state) => {
        const { [productId]: _, ...rest } = state.productSchedule
        return { productSchedule: rest }
      }),

      // Сброс демо данных
      resetToDemo: () => set({
        products: initialProducts,
        categories: initialCategories,
        cart: [],
        transactions: [],
        stockMovements: [],
        productSchedule: initialSchedule,
        settings: {
          currency: 'UZS',
          storeName: 'Мой магазин',
          storeAddress: '',
          taxRate: 0,
          receiptFooter: 'Спасибо за покупку!',
          theme: 'system',
        }
      })
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        transactions: state.transactions,
        stockMovements: state.stockMovements,
        settings: state.settings,
        cashiers: state.cashiers,
        isAuthenticated: state.isAuthenticated,
        currentCashier: state.currentCashier,
      })
    }
  )
)
