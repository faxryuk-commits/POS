/**
 * API Service для взаимодействия с бэкендом
 * 
 * Этот сервис обеспечивает:
 * - Единую точку входа для всех API запросов
 * - Автоматическую обработку ошибок
 * - Кэширование запросов
 * - Очередь для офлайн режима
 * - Retry логику
 */

import { logNetworkError } from './errorService'

// Базовый URL API (можно настроить через env переменные)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pos-system.example.com/v1'

// Настройки по умолчанию
const DEFAULT_TIMEOUT = 10000 // 10 секунд
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 секунда

/**
 * Класс для работы с API
 */
class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.token = null
    this.refreshToken = null
    this.onUnauthorized = null
  }

  /**
   * Установить токен авторизации
   */
  setToken(token, refreshToken = null) {
    this.token = token
    this.refreshToken = refreshToken
  }

  /**
   * Очистить токены
   */
  clearToken() {
    this.token = null
    this.refreshToken = null
  }

  /**
   * Установить callback для обработки 401 ошибки
   */
  setUnauthorizedHandler(handler) {
    this.onUnauthorized = handler
  }

  /**
   * Базовый метод для выполнения запросов
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config = {
      ...options,
      headers,
      signal: AbortSignal.timeout(options.timeout || DEFAULT_TIMEOUT)
    }

    try {
      const response = await this.fetchWithRetry(url, config, options.retries || MAX_RETRIES)
      
      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      // Для 204 No Content возвращаем null
      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      logNetworkError(error, url)
      throw error
    }
  }

  /**
   * Retry логика для запросов
   */
  async fetchWithRetry(url, config, retries) {
    let lastError

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, config)
        
        // Не ретраим клиентские ошибки (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response
        }
        
        if (response.ok || i === retries - 1) {
          return response
        }
        
        // Ждём перед следующей попыткой (экспоненциальная задержка)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)))
      } catch (error) {
        lastError = error
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)))
      }
    }

    throw lastError
  }

  /**
   * Обработка ошибок ответа
   */
  async handleErrorResponse(response) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: 'Unknown error' }
    }

    if (response.status === 401) {
      // Попытка обновить токен
      if (this.refreshToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          return // Можно повторить запрос
        }
      }
      
      if (this.onUnauthorized) {
        this.onUnauthorized()
      }
    }

    const error = new Error(errorData.message || `HTTP Error ${response.status}`)
    error.status = response.status
    error.data = errorData
    throw error
  }

  /**
   * Обновление токена доступа
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        this.setToken(data.accessToken, data.refreshToken)
        return true
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
    }
    
    this.clearToken()
    return false
  }

  // ============ HTTP методы ============

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

// Создаём экземпляр API сервиса
const api = new ApiService()

// ============ API Endpoints ============

/**
 * Авторизация
 */
export const authApi = {
  login: (pin) => api.post('/auth/login', { pin }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  verify: () => api.get('/auth/verify')
}

/**
 * Товары
 */
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  getByCategory: (category) => api.get(`/products/category/${encodeURIComponent(category)}`)
}

/**
 * Категории
 */
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`)
}

/**
 * Транзакции (продажи)
 */
export const transactionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/transactions${query ? '?' + query : ''}`)
  },
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transaction) => api.post('/transactions', transaction),
  getStats: (period = 'today') => api.get(`/transactions/stats?period=${period}`),
  getByDate: (startDate, endDate) => 
    api.get(`/transactions?startDate=${startDate}&endDate=${endDate}`)
}

/**
 * Склад
 */
export const stockApi = {
  getMovements: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/stock/movements${query ? '?' + query : ''}`)
  },
  addMovement: (movement) => api.post('/stock/movements', movement),
  getProductStock: (productId) => api.get(`/stock/products/${productId}`),
  getLowStock: (threshold = 5) => api.get(`/stock/low?threshold=${threshold}`)
}

/**
 * Кассиры
 */
export const cashiersApi = {
  getAll: () => api.get('/cashiers'),
  getById: (id) => api.get(`/cashiers/${id}`),
  create: (cashier) => api.post('/cashiers', cashier),
  update: (id, cashier) => api.put(`/cashiers/${id}`, cashier),
  delete: (id) => api.delete(`/cashiers/${id}`),
  updatePin: (id, oldPin, newPin) => api.patch(`/cashiers/${id}/pin`, { oldPin, newPin })
}

/**
 * Настройки
 */
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
  getStore: () => api.get('/settings/store'),
  updateStore: (store) => api.put('/settings/store', store)
}

/**
 * Синхронизация
 */
export const syncApi = {
  // Получить все данные для первоначальной синхронизации
  getFullSync: () => api.get('/sync/full'),
  
  // Получить изменения с определённого момента
  getDelta: (since) => api.get(`/sync/delta?since=${since}`),
  
  // Отправить офлайн изменения
  pushChanges: (changes) => api.post('/sync/push', { changes }),
  
  // Получить конфликты
  getConflicts: () => api.get('/sync/conflicts'),
  
  // Разрешить конфликт
  resolveConflict: (conflictId, resolution) => 
    api.post(`/sync/conflicts/${conflictId}/resolve`, { resolution })
}

/**
 * Отчёты
 */
export const reportsApi = {
  getSalesReport: (startDate, endDate) => 
    api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
  getProductsReport: (startDate, endDate) => 
    api.get(`/reports/products?startDate=${startDate}&endDate=${endDate}`),
  getCashiersReport: (startDate, endDate) => 
    api.get(`/reports/cashiers?startDate=${startDate}&endDate=${endDate}`),
  getInventoryReport: () => api.get('/reports/inventory'),
  exportToPdf: (reportType, params) => 
    api.get(`/reports/${reportType}/pdf?${new URLSearchParams(params).toString()}`),
  exportToExcel: (reportType, params) => 
    api.get(`/reports/${reportType}/excel?${new URLSearchParams(params).toString()}`)
}

// Экспортируем экземпляр API для прямого использования
export default api
