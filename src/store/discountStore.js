/**
 * Discount Store - Скидочная система
 * 
 * Включает:
 * - Автоматические скидки (по условиям)
 * - Ручные скидки
 * - Промокоды
 * - Гибкие условия
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Типы скидок
export const DISCOUNT_TYPES = {
  PERCENT: 'percent',      // Процент от суммы
  FIXED: 'fixed',          // Фиксированная сумма
  PRODUCT_FREE: 'product_free', // Бесплатный товар
  BUY_X_GET_Y: 'buy_x_get_y',  // Купи X получи Y
}

// Типы условий
export const CONDITION_TYPES = {
  MIN_AMOUNT: 'min_amount',      // Мин. сумма заказа
  MIN_QUANTITY: 'min_quantity',  // Мин. количество товаров
  SPECIFIC_PRODUCTS: 'products', // Определённые товары
  CATEGORY: 'category',          // Категория товаров
  TIME_RANGE: 'time_range',      // Время действия
  DAY_OF_WEEK: 'day_of_week',    // День недели
  FIRST_ORDER: 'first_order',    // Первый заказ
  CUSTOMER_TYPE: 'customer',     // Тип клиента
}

// Демо скидки
const initialDiscounts = [
  {
    id: 'disc1',
    name: 'Скидка 5% при заказе от 500₸',
    description: 'Автоматическая скидка при сумме заказа от 500₸',
    type: DISCOUNT_TYPES.PERCENT,
    value: 5,
    conditions: [
      { type: CONDITION_TYPES.MIN_AMOUNT, value: 500 }
    ],
    isActive: true,
    isAutomatic: true,
    priority: 1,
    maxUses: null,
    usedCount: 0,
    validFrom: null,
    validTo: null,
    stackable: false, // Можно ли комбинировать с другими скидками
  },
  {
    id: 'disc2',
    name: 'Скидка 10% при заказе от 1000₸',
    description: 'Автоматическая скидка при сумме заказа от 1000₸',
    type: DISCOUNT_TYPES.PERCENT,
    value: 10,
    conditions: [
      { type: CONDITION_TYPES.MIN_AMOUNT, value: 1000 }
    ],
    isActive: true,
    isAutomatic: true,
    priority: 2,
    maxUses: null,
    usedCount: 0,
    validFrom: null,
    validTo: null,
    stackable: false,
  },
  {
    id: 'disc3',
    name: 'Happy Hour: -15% на напитки',
    description: 'Скидка 15% на все напитки с 14:00 до 17:00',
    type: DISCOUNT_TYPES.PERCENT,
    value: 15,
    conditions: [
      { type: CONDITION_TYPES.TIME_RANGE, from: '14:00', to: '17:00' },
      { type: CONDITION_TYPES.CATEGORY, value: 'Напитки' }
    ],
    isActive: true,
    isAutomatic: true,
    priority: 3,
    maxUses: null,
    usedCount: 0,
    validFrom: null,
    validTo: null,
    stackable: true,
  },
  {
    id: 'disc4',
    name: '3+1 на шоколад',
    description: 'Купи 3 шоколадки - получи 4-ю бесплатно',
    type: DISCOUNT_TYPES.BUY_X_GET_Y,
    value: { buyX: 3, getY: 1 },
    conditions: [
      { type: CONDITION_TYPES.CATEGORY, value: 'Сладости' }
    ],
    isActive: true,
    isAutomatic: true,
    priority: 4,
    maxUses: null,
    usedCount: 0,
    validFrom: null,
    validTo: null,
    stackable: false,
  },
  {
    id: 'disc5',
    name: 'Пятничная скидка 20%',
    description: 'Скидка 20% каждую пятницу',
    type: DISCOUNT_TYPES.PERCENT,
    value: 20,
    conditions: [
      { type: CONDITION_TYPES.DAY_OF_WEEK, value: [5] } // Пятница
    ],
    isActive: false,
    isAutomatic: true,
    priority: 5,
    maxUses: null,
    usedCount: 0,
    validFrom: null,
    validTo: null,
    stackable: false,
  }
]

// Промокоды
const initialPromocodes = [
  {
    id: 'promo1',
    code: 'WELCOME10',
    name: 'Приветственная скидка',
    description: '10% скидка для новых клиентов',
    type: DISCOUNT_TYPES.PERCENT,
    value: 10,
    isActive: true,
    maxUses: 100,
    usedCount: 5,
    validFrom: null,
    validTo: '2026-12-31',
    minAmount: 200,
  },
  {
    id: 'promo2',
    code: 'COFFEE50',
    name: 'Скидка на кофе',
    description: '50₸ скидка на любой кофейный напиток',
    type: DISCOUNT_TYPES.FIXED,
    value: 50,
    isActive: true,
    maxUses: 50,
    usedCount: 12,
    validFrom: null,
    validTo: null,
    minAmount: 0,
    categoryFilter: 'Напитки',
  }
]

// Шаблоны для быстрого создания скидок
export const DISCOUNT_TEMPLATES = [
  {
    id: 'tpl1',
    name: '🏷️ Скидка от суммы',
    description: 'Процент при достижении минимальной суммы',
    template: {
      type: DISCOUNT_TYPES.PERCENT,
      value: 5,
      conditions: [{ type: CONDITION_TYPES.MIN_AMOUNT, value: 500 }],
      isAutomatic: true,
    }
  },
  {
    id: 'tpl2',
    name: '⏰ Happy Hour',
    description: 'Скидка в определённое время',
    template: {
      type: DISCOUNT_TYPES.PERCENT,
      value: 15,
      conditions: [{ type: CONDITION_TYPES.TIME_RANGE, from: '14:00', to: '17:00' }],
      isAutomatic: true,
    }
  },
  {
    id: 'tpl3',
    name: '🎁 3+1 Акция',
    description: 'Купи 3 - получи 1 бесплатно',
    template: {
      type: DISCOUNT_TYPES.BUY_X_GET_Y,
      value: { buyX: 3, getY: 1 },
      isAutomatic: true,
    }
  },
  {
    id: 'tpl4',
    name: '📅 Скидка по дням недели',
    description: 'Скидка в определённые дни',
    template: {
      type: DISCOUNT_TYPES.PERCENT,
      value: 10,
      conditions: [{ type: CONDITION_TYPES.DAY_OF_WEEK, value: [1, 2] }], // Пн, Вт
      isAutomatic: true,
    }
  },
  {
    id: 'tpl5',
    name: '📦 Скидка на категорию',
    description: 'Процент на определённую категорию',
    template: {
      type: DISCOUNT_TYPES.PERCENT,
      value: 10,
      conditions: [{ type: CONDITION_TYPES.CATEGORY, value: '' }],
      isAutomatic: true,
    }
  },
  {
    id: 'tpl6',
    name: '🎟️ Промокод',
    description: 'Скидка по коду',
    template: {
      type: DISCOUNT_TYPES.PERCENT,
      value: 10,
      isAutomatic: false,
    }
  }
]

export const useDiscountStore = create(
  persist(
    (set, get) => ({
      discounts: initialDiscounts,
      promocodes: initialPromocodes,
      appliedDiscounts: [], // Применённые скидки к текущей корзине
      appliedPromocode: null,

      // ============ ПРОВЕРКА УСЛОВИЙ ============

      /**
       * Проверить условие скидки
       */
      checkCondition: (condition, cart, cartTotal, categories) => {
        const now = new Date()
        
        switch (condition.type) {
          case CONDITION_TYPES.MIN_AMOUNT:
            return cartTotal >= condition.value
            
          case CONDITION_TYPES.MIN_QUANTITY:
            const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0)
            return totalQty >= condition.value
            
          case CONDITION_TYPES.TIME_RANGE:
            const currentTime = now.toTimeString().slice(0, 5)
            return currentTime >= condition.from && currentTime <= condition.to
            
          case CONDITION_TYPES.DAY_OF_WEEK:
            return condition.value.includes(now.getDay())
            
          case CONDITION_TYPES.CATEGORY:
            return cart.some(item => item.category === condition.value)
            
          case CONDITION_TYPES.SPECIFIC_PRODUCTS:
            return cart.some(item => condition.value.includes(item.id))
            
          default:
            return true
        }
      },

      /**
       * Получить применимые автоматические скидки
       */
      getApplicableDiscounts: (cart, cartTotal) => {
        const { discounts, checkCondition } = get()
        
        return discounts
          .filter(d => d.isActive && d.isAutomatic)
          .filter(d => {
            // Проверяем все условия
            if (!d.conditions || d.conditions.length === 0) return true
            return d.conditions.every(cond => checkCondition(cond, cart, cartTotal))
          })
          .sort((a, b) => b.priority - a.priority)
      },

      /**
       * Рассчитать скидку
       */
      calculateDiscount: (discount, cart, cartTotal) => {
        switch (discount.type) {
          case DISCOUNT_TYPES.PERCENT:
            // Если есть фильтр по категории, считаем только для этой категории
            const categoryCondition = discount.conditions?.find(c => c.type === CONDITION_TYPES.CATEGORY)
            if (categoryCondition) {
              const categoryTotal = cart
                .filter(item => item.category === categoryCondition.value)
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
              return Math.round(categoryTotal * discount.value / 100)
            }
            return Math.round(cartTotal * discount.value / 100)
            
          case DISCOUNT_TYPES.FIXED:
            return Math.min(discount.value, cartTotal)
            
          case DISCOUNT_TYPES.BUY_X_GET_Y:
            // Находим товары категории и считаем бесплатные
            const catCond = discount.conditions?.find(c => c.type === CONDITION_TYPES.CATEGORY)
            if (catCond) {
              const categoryItems = cart.filter(item => item.category === catCond.value)
              const totalCatQty = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
              const freeItems = Math.floor(totalCatQty / (discount.value.buyX + discount.value.getY)) * discount.value.getY
              // Считаем скидку как стоимость бесплатных товаров (самых дешёвых)
              const sortedPrices = categoryItems.flatMap(item => Array(item.quantity).fill(item.price)).sort((a, b) => a - b)
              return sortedPrices.slice(0, freeItems).reduce((sum, p) => sum + p, 0)
            }
            return 0
            
          default:
            return 0
        }
      },

      /**
       * Получить лучшую скидку (не stackable)
       */
      getBestDiscount: (cart, cartTotal) => {
        const { getApplicableDiscounts, calculateDiscount } = get()
        const applicable = getApplicableDiscounts(cart, cartTotal)
        
        if (applicable.length === 0) return null
        
        // Считаем размер каждой скидки и выбираем лучшую
        let best = null
        let bestAmount = 0
        
        applicable.forEach(discount => {
          const amount = calculateDiscount(discount, cart, cartTotal)
          if (amount > bestAmount) {
            best = discount
            bestAmount = amount
          }
        })
        
        return best ? { ...best, calculatedAmount: bestAmount } : null
      },

      /**
       * Получить все применимые stackable скидки
       */
      getStackableDiscounts: (cart, cartTotal) => {
        const { getApplicableDiscounts, calculateDiscount } = get()
        
        return getApplicableDiscounts(cart, cartTotal)
          .filter(d => d.stackable)
          .map(d => ({
            ...d,
            calculatedAmount: calculateDiscount(d, cart, cartTotal)
          }))
      },

      /**
       * Рассчитать итоговую скидку
       */
      getTotalDiscount: (cart, cartTotal) => {
        const { getBestDiscount, getStackableDiscounts, appliedPromocode, calculatePromocode } = get()
        
        let totalDiscount = 0
        const appliedList = []
        
        // 1. Лучшая не-stackable скидка
        const bestDiscount = getBestDiscount(cart, cartTotal)
        if (bestDiscount) {
          totalDiscount += bestDiscount.calculatedAmount
          appliedList.push(bestDiscount)
        }
        
        // 2. Все stackable скидки
        const stackable = getStackableDiscounts(cart, cartTotal)
        stackable.forEach(d => {
          totalDiscount += d.calculatedAmount
          appliedList.push(d)
        })
        
        // 3. Промокод
        if (appliedPromocode) {
          const promoDiscount = calculatePromocode(appliedPromocode, cart, cartTotal)
          if (promoDiscount > 0) {
            totalDiscount += promoDiscount
            appliedList.push({ ...appliedPromocode, calculatedAmount: promoDiscount, isPromocode: true })
          }
        }
        
        return {
          total: totalDiscount,
          discounts: appliedList
        }
      },

      // ============ ПРОМОКОДЫ ============

      /**
       * Применить промокод
       */
      applyPromocode: (code) => {
        const { promocodes } = get()
        const promo = promocodes.find(p => 
          p.code.toUpperCase() === code.toUpperCase() && p.isActive
        )
        
        if (!promo) {
          return { success: false, error: 'Промокод не найден' }
        }
        
        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
          return { success: false, error: 'Промокод больше не действует' }
        }
        
        if (promo.validTo && new Date(promo.validTo) < new Date()) {
          return { success: false, error: 'Срок действия промокода истёк' }
        }
        
        set({ appliedPromocode: promo })
        return { success: true, promo }
      },

      /**
       * Убрать промокод
       */
      removePromocode: () => set({ appliedPromocode: null }),

      /**
       * Рассчитать скидку по промокоду
       */
      calculatePromocode: (promo, cart, cartTotal) => {
        if (promo.minAmount && cartTotal < promo.minAmount) {
          return 0
        }
        
        if (promo.categoryFilter) {
          const categoryTotal = cart
            .filter(item => item.category === promo.categoryFilter)
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
          
          if (promo.type === DISCOUNT_TYPES.PERCENT) {
            return Math.round(categoryTotal * promo.value / 100)
          }
          return Math.min(promo.value, categoryTotal)
        }
        
        if (promo.type === DISCOUNT_TYPES.PERCENT) {
          return Math.round(cartTotal * promo.value / 100)
        }
        return Math.min(promo.value, cartTotal)
      },

      // ============ УПРАВЛЕНИЕ СКИДКАМИ ============

      /**
       * Добавить скидку
       */
      addDiscount: (discount) => set((state) => ({
        discounts: [...state.discounts, { 
          ...discount, 
          id: `disc-${Date.now()}`,
          usedCount: 0
        }]
      })),

      /**
       * Обновить скидку
       */
      updateDiscount: (id, updates) => set((state) => ({
        discounts: state.discounts.map(d => d.id === id ? { ...d, ...updates } : d)
      })),

      /**
       * Удалить скидку
       */
      deleteDiscount: (id) => set((state) => ({
        discounts: state.discounts.filter(d => d.id !== id)
      })),

      /**
       * Переключить активность
       */
      toggleDiscount: (id) => set((state) => ({
        discounts: state.discounts.map(d => 
          d.id === id ? { ...d, isActive: !d.isActive } : d
        )
      })),

      /**
       * Добавить промокод
       */
      addPromocode: (promo) => set((state) => ({
        promocodes: [...state.promocodes, {
          ...promo,
          id: `promo-${Date.now()}`,
          usedCount: 0
        }]
      })),

      /**
       * Удалить промокод
       */
      deletePromocode: (id) => set((state) => ({
        promocodes: state.promocodes.filter(p => p.id !== id)
      })),

      /**
       * Создать скидку из шаблона
       */
      createFromTemplate: (templateId, customizations) => {
        const template = DISCOUNT_TEMPLATES.find(t => t.id === templateId)
        if (!template) return null
        
        const newDiscount = {
          ...template.template,
          ...customizations,
          name: customizations.name || template.name,
          description: customizations.description || template.description,
        }
        
        get().addDiscount(newDiscount)
        return newDiscount
      },

      // Сброс
      resetDiscounts: () => set({
        discounts: initialDiscounts,
        promocodes: initialPromocodes,
        appliedDiscounts: [],
        appliedPromocode: null,
      })
    }),
    {
      name: 'pos-discount-storage'
    }
  )
)
