/**
 * Mock API для разработки и тестирования
 * 
 * Этот модуль имитирует бэкенд API, позволяя:
 * - Тестировать приложение без реального сервера
 * - Разрабатывать фронтенд параллельно с бэкендом
 * - Симулировать различные сценарии (задержки, ошибки)
 */

// Задержка для имитации сетевых запросов
const MOCK_DELAY = 300

// Имитация задержки сети
const delay = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms))

// Генератор ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

// Имитация хранилища данных
let mockData = {
  products: [],
  categories: [],
  transactions: [],
  stockMovements: [],
  cashiers: [],
  settings: {}
}

// Инициализация mock данных из localStorage
const initMockData = () => {
  try {
    const stored = localStorage.getItem('pos-store')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.state) {
        mockData.products = parsed.state.products || []
        mockData.categories = parsed.state.categories || []
        mockData.transactions = parsed.state.transactions || []
        mockData.stockMovements = parsed.state.stockMovements || []
        mockData.cashiers = parsed.state.cashiers || []
        mockData.settings = parsed.state.settings || {}
      }
    }
  } catch (e) {
    console.warn('Failed to init mock data:', e)
  }
}

// Инициализируем при загрузке
if (typeof window !== 'undefined') {
  initMockData()
}

/**
 * Mock API реализация
 */
export const mockApi = {
  // ============ Auth ============
  auth: {
    login: async (pin) => {
      await delay()
      const cashier = mockData.cashiers.find(c => c.pin === pin)
      if (cashier) {
        return { 
          success: true, 
          cashier,
          token: 'mock-token-' + generateId(),
          refreshToken: 'mock-refresh-' + generateId()
        }
      }
      throw { status: 401, message: 'Неверный PIN-код' }
    },
    
    logout: async () => {
      await delay(100)
      return { success: true }
    },
    
    verify: async () => {
      await delay(100)
      return { valid: true }
    }
  },

  // ============ Products ============
  products: {
    getAll: async () => {
      await delay()
      return { products: mockData.products }
    },
    
    getById: async (id) => {
      await delay()
      const product = mockData.products.find(p => p.id === parseInt(id))
      if (!product) throw { status: 404, message: 'Товар не найден' }
      return product
    },
    
    getByBarcode: async (barcode) => {
      await delay()
      const product = mockData.products.find(p => p.barcode === barcode)
      if (!product) throw { status: 404, message: 'Товар не найден' }
      return product
    },
    
    create: async (product) => {
      await delay()
      const newProduct = {
        ...product,
        id: mockData.products.length + 1,
        createdAt: new Date().toISOString()
      }
      mockData.products.push(newProduct)
      return newProduct
    },
    
    update: async (id, updates) => {
      await delay()
      const index = mockData.products.findIndex(p => p.id === parseInt(id))
      if (index === -1) throw { status: 404, message: 'Товар не найден' }
      mockData.products[index] = { ...mockData.products[index], ...updates }
      return mockData.products[index]
    },
    
    delete: async (id) => {
      await delay()
      const index = mockData.products.findIndex(p => p.id === parseInt(id))
      if (index === -1) throw { status: 404, message: 'Товар не найден' }
      mockData.products.splice(index, 1)
      return { success: true }
    },
    
    search: async (query) => {
      await delay()
      const q = query.toLowerCase()
      const results = mockData.products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode?.includes(q)
      )
      return { products: results }
    }
  },

  // ============ Categories ============
  categories: {
    getAll: async () => {
      await delay()
      return { categories: mockData.categories }
    },
    
    create: async (category) => {
      await delay()
      const newCategory = {
        ...category,
        id: mockData.categories.length + 1
      }
      mockData.categories.push(newCategory)
      return newCategory
    },
    
    update: async (id, updates) => {
      await delay()
      const index = mockData.categories.findIndex(c => c.id === parseInt(id))
      if (index === -1) throw { status: 404, message: 'Категория не найдена' }
      mockData.categories[index] = { ...mockData.categories[index], ...updates }
      return mockData.categories[index]
    },
    
    delete: async (id) => {
      await delay()
      const index = mockData.categories.findIndex(c => c.id === parseInt(id))
      if (index === -1) throw { status: 404, message: 'Категория не найдена' }
      mockData.categories.splice(index, 1)
      return { success: true }
    }
  },

  // ============ Transactions ============
  transactions: {
    getAll: async (params = {}) => {
      await delay()
      let transactions = [...mockData.transactions]
      
      if (params.startDate) {
        transactions = transactions.filter(t => 
          new Date(t.date) >= new Date(params.startDate)
        )
      }
      if (params.endDate) {
        transactions = transactions.filter(t => 
          new Date(t.date) <= new Date(params.endDate)
        )
      }
      
      return { 
        transactions,
        total: transactions.length
      }
    },
    
    getById: async (id) => {
      await delay()
      const transaction = mockData.transactions.find(t => t.id === parseInt(id))
      if (!transaction) throw { status: 404, message: 'Транзакция не найдена' }
      return transaction
    },
    
    create: async (transaction) => {
      await delay()
      const newTransaction = {
        ...transaction,
        id: mockData.transactions.length + 1,
        receiptNumber: `R-${Date.now()}`,
        createdAt: new Date().toISOString()
      }
      mockData.transactions.unshift(newTransaction)
      return newTransaction
    },
    
    getStats: async (period = 'today') => {
      await delay()
      const now = new Date()
      let startDate
      
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = new Date(0)
      }
      
      const periodTransactions = mockData.transactions.filter(t =>
        new Date(t.date) >= startDate && t.type === 'sale'
      )
      
      return {
        salesCount: periodTransactions.length,
        revenue: periodTransactions.reduce((sum, t) => sum + t.total, 0),
        itemsSold: periodTransactions.reduce((sum, t) => 
          sum + t.items.reduce((s, i) => s + i.quantity, 0), 0
        ),
        averageCheck: periodTransactions.length > 0
          ? periodTransactions.reduce((sum, t) => sum + t.total, 0) / periodTransactions.length
          : 0
      }
    }
  },

  // ============ Stock ============
  stock: {
    getMovements: async (params = {}) => {
      await delay()
      return { movements: mockData.stockMovements }
    },
    
    addMovement: async (movement) => {
      await delay()
      const newMovement = {
        ...movement,
        id: mockData.stockMovements.length + 1,
        date: new Date().toISOString()
      }
      mockData.stockMovements.push(newMovement)
      return newMovement
    },
    
    getLowStock: async (threshold = 5) => {
      await delay()
      const lowStock = mockData.products.filter(p => p.stock <= threshold && p.stock > 0)
      return { products: lowStock }
    }
  },

  // ============ Cashiers ============
  cashiers: {
    getAll: async () => {
      await delay()
      return { cashiers: mockData.cashiers }
    },
    
    create: async (cashier) => {
      await delay()
      const newCashier = {
        ...cashier,
        id: mockData.cashiers.length + 1
      }
      mockData.cashiers.push(newCashier)
      return newCashier
    },
    
    update: async (id, updates) => {
      await delay()
      const index = mockData.cashiers.findIndex(c => c.id === parseInt(id))
      if (index === -1) throw { status: 404, message: 'Кассир не найден' }
      mockData.cashiers[index] = { ...mockData.cashiers[index], ...updates }
      return mockData.cashiers[index]
    },
    
    delete: async (id) => {
      await delay()
      const index = mockData.cashiers.findIndex(c => c.id === parseInt(id))
      if (index === -1) throw { status: 404, message: 'Кассир не найден' }
      mockData.cashiers.splice(index, 1)
      return { success: true }
    }
  },

  // ============ Settings ============
  settings: {
    get: async () => {
      await delay()
      return mockData.settings
    },
    
    update: async (settings) => {
      await delay()
      mockData.settings = { ...mockData.settings, ...settings }
      return mockData.settings
    }
  },

  // ============ Sync ============
  sync: {
    getFullSync: async () => {
      await delay(500)
      return {
        timestamp: new Date().toISOString(),
        products: mockData.products,
        categories: mockData.categories,
        transactions: mockData.transactions.slice(0, 100),
        stockMovements: mockData.stockMovements.slice(0, 100),
        cashiers: mockData.cashiers,
        settings: mockData.settings
      }
    },
    
    getDelta: async (since) => {
      await delay()
      // В реальном API здесь была бы логика получения только изменений
      return {
        timestamp: new Date().toISOString(),
        changes: []
      }
    },
    
    pushChanges: async (changes) => {
      await delay()
      // В реальном API здесь была бы логика применения изменений
      return {
        success: true,
        applied: changes.length,
        conflicts: []
      }
    }
  }
}

/**
 * Проверка, использовать ли mock API
 */
export const useMockApi = () => {
  // Используем mock если нет реального API URL или в режиме разработки
  return !import.meta.env.VITE_API_URL || import.meta.env.DEV
}

/**
 * Получить API (mock или реальный)
 */
export const getApi = () => {
  if (useMockApi()) {
    return mockApi
  }
  // Импортируем реальный API
  return import('./api').then(m => m.default)
}

export default mockApi
