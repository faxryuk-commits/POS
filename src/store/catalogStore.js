/**
 * Catalog Store - Расширенный каталог товаров
 * 
 * Включает:
 * - Модификаторы (добавки, размеры)
 * - Комбо и сеты
 * - Продуктовые карты
 * - Иерархические категории
 * - Варианты товаров
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ ДЕМО ДАННЫЕ ============

// Группы модификаторов
const initialModifierGroups = [
  {
    id: 1,
    name: 'Размер напитка',
    type: 'single', // single = один выбор, multiple = несколько
    required: true,
    modifiers: [
      { id: 101, name: 'Маленький (0.3л)', price: 0 },
      { id: 102, name: 'Средний (0.5л)', price: 20 },
      { id: 103, name: 'Большой (0.7л)', price: 40 },
    ]
  },
  {
    id: 2,
    name: 'Добавки к кофе',
    type: 'multiple',
    required: false,
    modifiers: [
      { id: 201, name: 'Молоко', price: 15 },
      { id: 202, name: 'Сливки', price: 25 },
      { id: 203, name: 'Сахар', price: 0 },
      { id: 204, name: 'Корица', price: 10 },
      { id: 205, name: 'Сироп карамель', price: 30 },
      { id: 206, name: 'Сироп ваниль', price: 30 },
    ]
  },
  {
    id: 3,
    name: 'Соус',
    type: 'single',
    required: false,
    modifiers: [
      { id: 301, name: 'Кетчуп', price: 0 },
      { id: 302, name: 'Майонез', price: 0 },
      { id: 303, name: 'Горчица', price: 0 },
      { id: 304, name: 'Сырный соус', price: 20 },
      { id: 305, name: 'Барбекю', price: 15 },
    ]
  },
  {
    id: 4,
    name: 'Температура',
    type: 'single',
    required: true,
    modifiers: [
      { id: 401, name: 'Холодный', price: 0 },
      { id: 402, name: 'Тёплый', price: 0 },
      { id: 403, name: 'Горячий', price: 0 },
    ]
  },
  {
    id: 5,
    name: 'Упаковка',
    type: 'single',
    required: false,
    modifiers: [
      { id: 501, name: 'Без упаковки', price: 0 },
      { id: 502, name: 'Пакет', price: 5 },
      { id: 503, name: 'Подарочная упаковка', price: 50 },
    ]
  }
]

// Иерархические категории
const initialCategories = [
  {
    id: 1,
    name: 'Напитки',
    icon: '🥤',
    color: '#3b82f6',
    subcategories: [
      { id: 11, name: 'Газированные', icon: '🥤' },
      { id: 12, name: 'Вода', icon: '💧' },
      { id: 13, name: 'Соки', icon: '🧃' },
      { id: 14, name: 'Горячие напитки', icon: '☕' },
      { id: 15, name: 'Алкоголь', icon: '🍺' },
    ]
  },
  {
    id: 2,
    name: 'Еда',
    icon: '🍔',
    color: '#f59e0b',
    subcategories: [
      { id: 21, name: 'Хлеб и выпечка', icon: '🍞' },
      { id: 22, name: 'Молочные продукты', icon: '🥛' },
      { id: 23, name: 'Снеки', icon: '🍿' },
      { id: 24, name: 'Сладости', icon: '🍫' },
      { id: 25, name: 'Фрукты и овощи', icon: '🍎' },
    ]
  },
  {
    id: 3,
    name: 'Табак',
    icon: '🚬',
    color: '#6b7280',
    subcategories: [
      { id: 31, name: 'Сигареты', icon: '🚬' },
      { id: 32, name: 'Вейпы', icon: '💨' },
    ]
  },
  {
    id: 4,
    name: 'Бытовое',
    icon: '🧴',
    color: '#8b5cf6',
    subcategories: [
      { id: 41, name: 'Гигиена', icon: '🧼' },
      { id: 42, name: 'Канцелярия', icon: '✏️' },
    ]
  }
]

// Комбо-наборы (управляемые)
const initialCombos = [
  {
    id: 'combo1',
    name: 'Перекус',
    description: 'Идеально для быстрого перекуса',
    icon: '🍔',
    productIds: [1, 7], // Coca-Cola + Чипсы
    discount: 10,
    discountType: 'percent', // percent или fixed
    isActive: true,
    validFrom: null,
    validTo: null,
    minQuantity: 1,
    maxQuantity: 10,
  },
  {
    id: 'combo2',
    name: 'Кофе-брейк',
    description: 'Кофе с шоколадом',
    icon: '☕',
    productIds: [10, 9], // Кофе + Milka
    discount: 15,
    discountType: 'percent',
    isActive: true,
    validFrom: null,
    validTo: null,
    minQuantity: 1,
    maxQuantity: 5,
  },
  {
    id: 'combo3',
    name: 'Завтрак',
    description: 'Классический завтрак',
    icon: '🍞',
    productIds: [3, 4], // Хлеб + Молоко
    discount: 10,
    discountType: 'percent',
    isActive: true,
    validFrom: null,
    validTo: null,
    minQuantity: 1,
    maxQuantity: 5,
  },
  {
    id: 'combo4',
    name: 'Пятница',
    description: 'Для хорошего вечера',
    icon: '🍺',
    productIds: [12, 7], // Пиво + Чипсы
    discount: 12,
    discountType: 'percent',
    isActive: true,
    validFrom: '18:00',
    validTo: '23:59',
    minQuantity: 1,
    maxQuantity: 10,
  }
]

// Сеты (фиксированная цена за набор)
const initialSets = [
  {
    id: 'set1',
    name: 'Бизнес-ланч',
    description: 'Полноценный обед',
    icon: '🍱',
    fixedPrice: 350,
    products: [
      { productId: 3, quantity: 1 }, // Хлеб
      { productId: 4, quantity: 1 }, // Молоко
      { productId: 5, quantity: 0.5 }, // Яблоки 0.5кг
    ],
    isActive: true,
    availableFrom: '11:00',
    availableTo: '15:00',
  },
  {
    id: 'set2',
    name: 'Вечерний сет',
    description: 'Расслабься после работы',
    icon: '🌙',
    fixedPrice: 250,
    products: [
      { productId: 12, quantity: 2 }, // 2 Пива
      { productId: 7, quantity: 1 }, // Чипсы
    ],
    isActive: true,
    availableFrom: '17:00',
    availableTo: '23:00',
  }
]

// Расширенные продуктовые карты
const initialProductCards = {
  1: { // Coca-Cola
    description: 'Классический освежающий напиток',
    ingredients: ['Вода', 'Сахар', 'Карамельный краситель', 'Фосфорная кислота', 'Натуральные ароматизаторы', 'Кофеин'],
    allergens: [],
    nutrition: { calories: 42, protein: 0, fat: 0, carbs: 10.6 }, // на 100мл
    weight: '500мл',
    manufacturer: 'The Coca-Cola Company',
    countryOfOrigin: 'Россия',
    shelfLife: '12 месяцев',
    storageConditions: 'Хранить при t от 0 до +25°C',
    modifierGroupIds: [1, 4], // Размер, Температура
    tags: ['популярное', 'газированное', 'прохладительное'],
    images: [],
    sku: 'COCA-500',
    isVisible: true,
    isFeatured: true,
  },
  4: { // Молоко
    description: 'Свежее пастеризованное молоко',
    ingredients: ['Молоко коровье'],
    allergens: ['Молоко', 'Лактоза'],
    nutrition: { calories: 54, protein: 2.9, fat: 2.5, carbs: 4.8 },
    weight: '1л',
    manufacturer: 'Простоквашино',
    countryOfOrigin: 'Россия',
    shelfLife: '14 дней',
    storageConditions: 'Хранить при t от +2 до +6°C',
    modifierGroupIds: [],
    tags: ['молочное', 'натуральное'],
    images: [],
    sku: 'MILK-1L',
    isVisible: true,
    isFeatured: false,
  },
  10: { // Кофе 3в1
    description: 'Растворимый кофе с молоком и сахаром',
    ingredients: ['Сахар', 'Сливки растительные', 'Кофе растворимый'],
    allergens: ['Молоко'],
    nutrition: { calories: 450, protein: 3, fat: 18, carbs: 68 },
    weight: '18г',
    manufacturer: 'Nescafe',
    countryOfOrigin: 'Россия',
    shelfLife: '24 месяца',
    storageConditions: 'Хранить в сухом месте при t до +25°C',
    modifierGroupIds: [2, 4], // Добавки к кофе, Температура
    tags: ['кофе', 'горячее', 'быстрое'],
    images: [],
    sku: 'COFFEE-3in1',
    isVisible: true,
    isFeatured: true,
  },
  7: { // Чипсы
    description: 'Хрустящие картофельные чипсы',
    ingredients: ['Картофель', 'Растительное масло', 'Соль', 'Ароматизаторы'],
    allergens: ['Глютен'],
    nutrition: { calories: 530, protein: 6, fat: 30, carbs: 53 },
    weight: '150г',
    manufacturer: 'Lays',
    countryOfOrigin: 'Россия',
    shelfLife: '6 месяцев',
    storageConditions: 'Хранить в сухом месте',
    modifierGroupIds: [3], // Соус
    tags: ['снеки', 'к пиву', 'популярное'],
    images: [],
    sku: 'CHIPS-150',
    isVisible: true,
    isFeatured: true,
  }
}

// Варианты товаров
const initialVariants = [
  {
    id: 'var1',
    productId: 1, // Coca-Cola
    name: 'Coca-Cola Zero',
    priceDiff: 10, // +10 к базовой цене
    stockDiff: 0, // отдельный учёт или общий
    barcode: '4600000000001-Z',
    attributes: { sugar: 'без сахара' }
  },
  {
    id: 'var2',
    productId: 1,
    name: 'Coca-Cola Vanilla',
    priceDiff: 15,
    stockDiff: 0,
    barcode: '4600000000001-V',
    attributes: { flavor: 'ваниль' }
  },
  {
    id: 'var3',
    productId: 4, // Молоко
    name: 'Молоко 2.5%',
    priceDiff: 0,
    barcode: '4600000000004-25',
    attributes: { fatContent: '2.5%' }
  },
  {
    id: 'var4',
    productId: 4,
    name: 'Молоко 3.2%',
    priceDiff: 10,
    barcode: '4600000000004-32',
    attributes: { fatContent: '3.2%' }
  }
]

// ============ STORE ============

export const useCatalogStore = create(
  persist(
    (set, get) => ({
      // Данные
      modifierGroups: initialModifierGroups,
      categories: initialCategories,
      combos: initialCombos,
      sets: initialSets,
      productCards: initialProductCards,
      variants: initialVariants,

      // ============ МОДИФИКАТОРЫ ============
      
      /**
       * Получить группы модификаторов для товара
       */
      getModifiersForProduct: (productId) => {
        const { productCards, modifierGroups } = get()
        const card = productCards[productId]
        if (!card || !card.modifierGroupIds) return []
        
        return card.modifierGroupIds
          .map(groupId => modifierGroups.find(g => g.id === groupId))
          .filter(Boolean)
      },

      /**
       * Добавить группу модификаторов
       */
      addModifierGroup: (group) => set((state) => ({
        modifierGroups: [...state.modifierGroups, { ...group, id: Date.now() }]
      })),

      /**
       * Обновить группу модификаторов
       */
      updateModifierGroup: (id, updates) => set((state) => ({
        modifierGroups: state.modifierGroups.map(g => 
          g.id === id ? { ...g, ...updates } : g
        )
      })),

      /**
       * Удалить группу модификаторов
       */
      deleteModifierGroup: (id) => set((state) => ({
        modifierGroups: state.modifierGroups.filter(g => g.id !== id)
      })),

      /**
       * Добавить модификатор в группу
       */
      addModifier: (groupId, modifier) => set((state) => ({
        modifierGroups: state.modifierGroups.map(g => 
          g.id === groupId
            ? { ...g, modifiers: [...g.modifiers, { ...modifier, id: Date.now() }] }
            : g
        )
      })),

      /**
       * Удалить модификатор из группы
       */
      deleteModifier: (groupId, modifierId) => set((state) => ({
        modifierGroups: state.modifierGroups.map(g => 
          g.id === groupId
            ? { ...g, modifiers: g.modifiers.filter(m => m.id !== modifierId) }
            : g
        )
      })),

      // ============ КАТЕГОРИИ ============

      /**
       * Получить все категории с подкатегориями
       */
      getAllCategories: () => {
        const { categories } = get()
        return categories
      },

      /**
       * Получить плоский список категорий для выбора
       */
      getFlatCategories: () => {
        const { categories } = get()
        const flat = []
        categories.forEach(cat => {
          flat.push({ id: cat.id, name: cat.name, icon: cat.icon, parentId: null })
          if (cat.subcategories) {
            cat.subcategories.forEach(sub => {
              flat.push({ id: sub.id, name: sub.name, icon: sub.icon, parentId: cat.id })
            })
          }
        })
        return flat
      },

      /**
       * Добавить категорию
       */
      addCategory: (category, parentId = null) => set((state) => {
        if (parentId) {
          // Добавляем подкатегорию
          return {
            categories: state.categories.map(cat =>
              cat.id === parentId
                ? { ...cat, subcategories: [...(cat.subcategories || []), { ...category, id: Date.now() }] }
                : cat
            )
          }
        }
        // Добавляем главную категорию
        return {
          categories: [...state.categories, { ...category, id: Date.now(), subcategories: [] }]
        }
      }),

      /**
       * Удалить категорию
       */
      deleteCategory: (id, parentId = null) => set((state) => {
        if (parentId) {
          return {
            categories: state.categories.map(cat =>
              cat.id === parentId
                ? { ...cat, subcategories: cat.subcategories.filter(s => s.id !== id) }
                : cat
            )
          }
        }
        return {
          categories: state.categories.filter(c => c.id !== id)
        }
      }),

      // ============ КОМБО ============

      /**
       * Получить активные комбо
       */
      getActiveCombos: () => {
        const { combos } = get()
        const now = new Date()
        const currentTime = now.toTimeString().slice(0, 5)
        
        return combos.filter(combo => {
          if (!combo.isActive) return false
          if (combo.validFrom && currentTime < combo.validFrom) return false
          if (combo.validTo && currentTime > combo.validTo) return false
          return true
        })
      },

      /**
       * Добавить комбо
       */
      addCombo: (combo) => set((state) => ({
        combos: [...state.combos, { ...combo, id: `combo-${Date.now()}` }]
      })),

      /**
       * Обновить комбо
       */
      updateCombo: (id, updates) => set((state) => ({
        combos: state.combos.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      /**
       * Удалить комбо
       */
      deleteCombo: (id) => set((state) => ({
        combos: state.combos.filter(c => c.id !== id)
      })),

      /**
       * Переключить активность комбо
       */
      toggleCombo: (id) => set((state) => ({
        combos: state.combos.map(c => 
          c.id === id ? { ...c, isActive: !c.isActive } : c
        )
      })),

      // ============ СЕТЫ ============

      /**
       * Получить активные сеты
       */
      getActiveSets: () => {
        const { sets } = get()
        const now = new Date()
        const currentTime = now.toTimeString().slice(0, 5)
        
        return sets.filter(set => {
          if (!set.isActive) return false
          if (set.availableFrom && currentTime < set.availableFrom) return false
          if (set.availableTo && currentTime > set.availableTo) return false
          return true
        })
      },

      /**
       * Добавить сет
       */
      addSet: (newSet) => set((state) => ({
        sets: [...state.sets, { ...newSet, id: `set-${Date.now()}` }]
      })),

      /**
       * Обновить сет
       */
      updateSet: (id, updates) => set((state) => ({
        sets: state.sets.map(s => s.id === id ? { ...s, ...updates } : s)
      })),

      /**
       * Удалить сет
       */
      deleteSet: (id) => set((state) => ({
        sets: state.sets.filter(s => s.id !== id)
      })),

      // ============ ПРОДУКТОВЫЕ КАРТЫ ============

      /**
       * Получить карту товара
       */
      getProductCard: (productId) => {
        const { productCards } = get()
        return productCards[productId] || null
      },

      /**
       * Обновить карту товара
       */
      updateProductCard: (productId, updates) => set((state) => ({
        productCards: {
          ...state.productCards,
          [productId]: { ...state.productCards[productId], ...updates }
        }
      })),

      /**
       * Создать карту товара
       */
      createProductCard: (productId, card) => set((state) => ({
        productCards: {
          ...state.productCards,
          [productId]: {
            description: '',
            ingredients: [],
            allergens: [],
            nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 },
            weight: '',
            manufacturer: '',
            countryOfOrigin: '',
            shelfLife: '',
            storageConditions: '',
            modifierGroupIds: [],
            tags: [],
            images: [],
            sku: '',
            isVisible: true,
            isFeatured: false,
            ...card
          }
        }
      })),

      // ============ ВАРИАНТЫ ============

      /**
       * Получить варианты товара
       */
      getVariants: (productId) => {
        const { variants } = get()
        return variants.filter(v => v.productId === productId)
      },

      /**
       * Добавить вариант
       */
      addVariant: (variant) => set((state) => ({
        variants: [...state.variants, { ...variant, id: `var-${Date.now()}` }]
      })),

      /**
       * Удалить вариант
       */
      deleteVariant: (id) => set((state) => ({
        variants: state.variants.filter(v => v.id !== id)
      })),

      // ============ ПОИСК И ФИЛЬТРАЦИЯ ============

      /**
       * Поиск по тегам
       */
      searchByTag: (tag) => {
        const { productCards } = get()
        return Object.entries(productCards)
          .filter(([_, card]) => card.tags?.includes(tag))
          .map(([id]) => parseInt(id))
      },

      /**
       * Получить featured товары
       */
      getFeaturedProducts: () => {
        const { productCards } = get()
        return Object.entries(productCards)
          .filter(([_, card]) => card.isFeatured)
          .map(([id]) => parseInt(id))
      },

      /**
       * Фильтр по аллергенам
       */
      getProductsWithoutAllergens: (allergens) => {
        const { productCards } = get()
        return Object.entries(productCards)
          .filter(([_, card]) => {
            if (!card.allergens) return true
            return !card.allergens.some(a => allergens.includes(a))
          })
          .map(([id]) => parseInt(id))
      },

      // ============ СБРОС ============

      resetCatalog: () => set({
        modifierGroups: initialModifierGroups,
        categories: initialCategories,
        combos: initialCombos,
        sets: initialSets,
        productCards: initialProductCards,
        variants: initialVariants,
      })
    }),
    {
      name: 'pos-catalog-storage'
    }
  )
)
