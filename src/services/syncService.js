/**
 * Sync Service - Сервис синхронизации данных
 * 
 * Отвечает за:
 * - Синхронизацию локальных данных с сервером
 * - Обработку офлайн очереди
 * - Разрешение конфликтов
 * - Управление версиями данных
 */

import { syncApi, productsApi, transactionsApi, stockApi, categoriesApi, cashiersApi, settingsApi } from './api'
import { logError, logWarning } from './errorService'

// Ключи для localStorage
const LAST_SYNC_KEY = 'pos-last-sync'
const SYNC_QUEUE_KEY = 'pos-sync-queue'
const SYNC_VERSION_KEY = 'pos-sync-version'

/**
 * Типы операций в очереди синхронизации
 */
export const SyncOperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
}

/**
 * Сущности для синхронизации
 */
export const SyncEntity = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  TRANSACTION: 'transaction',
  STOCK_MOVEMENT: 'stock_movement',
  CASHIER: 'cashier',
  SETTINGS: 'settings'
}

/**
 * Стратегии разрешения конфликтов
 */
export const ConflictResolution = {
  SERVER_WINS: 'server_wins',
  CLIENT_WINS: 'client_wins',
  MERGE: 'merge',
  MANUAL: 'manual'
}

/**
 * Класс сервиса синхронизации
 */
class SyncService {
  constructor() {
    this.isSyncing = false
    this.lastSyncTime = this.getLastSyncTime()
    this.syncQueue = this.loadQueue()
    this.listeners = new Set()
    this.conflictResolver = null
  }

  /**
   * Добавить слушателя событий синхронизации
   */
  addListener(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Уведомить слушателей о событии
   */
  notify(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('Sync listener error:', error)
      }
    })
  }

  /**
   * Получить время последней синхронизации
   */
  getLastSyncTime() {
    const stored = localStorage.getItem(LAST_SYNC_KEY)
    return stored ? new Date(stored) : null
  }

  /**
   * Сохранить время синхронизации
   */
  setLastSyncTime(time = new Date()) {
    this.lastSyncTime = time
    localStorage.setItem(LAST_SYNC_KEY, time.toISOString())
  }

  /**
   * Загрузить очередь из localStorage
   */
  loadQueue() {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Сохранить очередь в localStorage
   */
  saveQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue))
  }

  /**
   * Добавить операцию в очередь синхронизации
   */
  addToQueue(operation) {
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: new Date().toISOString(),
      retries: 0,
      ...operation
    }

    // Оптимизация: объединяем последовательные UPDATE операции для одной сущности
    const existingIndex = this.syncQueue.findIndex(
      q => q.entity === operation.entity && 
           q.entityId === operation.entityId &&
           q.type === SyncOperationType.UPDATE
    )

    if (existingIndex !== -1 && operation.type === SyncOperationType.UPDATE) {
      // Объединяем данные
      this.syncQueue[existingIndex] = {
        ...this.syncQueue[existingIndex],
        data: { ...this.syncQueue[existingIndex].data, ...operation.data },
        timestamp: item.timestamp
      }
    } else {
      this.syncQueue.push(item)
    }

    this.saveQueue()
    this.notify('queue_updated', { queueLength: this.syncQueue.length })

    // Пробуем синхронизировать если онлайн
    if (navigator.onLine && !this.isSyncing) {
      this.processQueue()
    }

    return item.id
  }

  /**
   * Удалить элемент из очереди
   */
  removeFromQueue(id) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id)
    this.saveQueue()
  }

  /**
   * Получить размер очереди
   */
  getQueueSize() {
    return this.syncQueue.length
  }

  /**
   * Обработать очередь синхронизации
   */
  async processQueue() {
    if (this.isSyncing || !navigator.onLine || this.syncQueue.length === 0) {
      return { processed: 0, failed: 0 }
    }

    this.isSyncing = true
    this.notify('sync_started', { queueLength: this.syncQueue.length })

    let processed = 0
    let failed = 0
    const failedItems = []

    for (const item of [...this.syncQueue]) {
      try {
        await this.processQueueItem(item)
        this.removeFromQueue(item.id)
        processed++
        this.notify('item_synced', { item, remaining: this.syncQueue.length })
      } catch (error) {
        failed++
        item.retries++
        item.lastError = error.message

        if (item.retries >= 3) {
          // Перемещаем в failed после 3 попыток
          failedItems.push(item)
          this.removeFromQueue(item.id)
        }

        logWarning(`Sync failed for ${item.entity}:${item.entityId}`, { 
          error: error.message,
          retries: item.retries 
        })
      }
    }

    this.isSyncing = false
    this.setLastSyncTime()
    
    this.notify('sync_completed', { 
      processed, 
      failed,
      remaining: this.syncQueue.length,
      failedItems
    })

    return { processed, failed, failedItems }
  }

  /**
   * Обработать один элемент очереди
   */
  async processQueueItem(item) {
    const { entity, type, entityId, data } = item

    switch (entity) {
      case SyncEntity.PRODUCT:
        return this.syncProduct(type, entityId, data)
      case SyncEntity.CATEGORY:
        return this.syncCategory(type, entityId, data)
      case SyncEntity.TRANSACTION:
        return this.syncTransaction(type, entityId, data)
      case SyncEntity.STOCK_MOVEMENT:
        return this.syncStockMovement(type, entityId, data)
      case SyncEntity.CASHIER:
        return this.syncCashier(type, entityId, data)
      case SyncEntity.SETTINGS:
        return this.syncSettings(data)
      default:
        throw new Error(`Unknown entity type: ${entity}`)
    }
  }

  // ============ Entity-specific sync methods ============

  async syncProduct(type, id, data) {
    switch (type) {
      case SyncOperationType.CREATE:
        return productsApi.create(data)
      case SyncOperationType.UPDATE:
        return productsApi.update(id, data)
      case SyncOperationType.DELETE:
        return productsApi.delete(id)
    }
  }

  async syncCategory(type, id, data) {
    switch (type) {
      case SyncOperationType.CREATE:
        return categoriesApi.create(data)
      case SyncOperationType.UPDATE:
        return categoriesApi.update(id, data)
      case SyncOperationType.DELETE:
        return categoriesApi.delete(id)
    }
  }

  async syncTransaction(type, id, data) {
    switch (type) {
      case SyncOperationType.CREATE:
        return transactionsApi.create(data)
      // Транзакции обычно не обновляются/удаляются
    }
  }

  async syncStockMovement(type, id, data) {
    switch (type) {
      case SyncOperationType.CREATE:
        return stockApi.addMovement(data)
    }
  }

  async syncCashier(type, id, data) {
    switch (type) {
      case SyncOperationType.CREATE:
        return cashiersApi.create(data)
      case SyncOperationType.UPDATE:
        return cashiersApi.update(id, data)
      case SyncOperationType.DELETE:
        return cashiersApi.delete(id)
    }
  }

  async syncSettings(data) {
    return settingsApi.update(data)
  }

  // ============ Full sync methods ============

  /**
   * Выполнить полную синхронизацию с сервером
   */
  async fullSync(onProgress) {
    if (!navigator.onLine) {
      throw new Error('No internet connection')
    }

    this.isSyncing = true
    this.notify('full_sync_started', {})

    try {
      // 1. Сначала отправляем локальные изменения
      onProgress?.({ step: 'pushing', progress: 0 })
      await this.processQueue()
      onProgress?.({ step: 'pushing', progress: 100 })

      // 2. Получаем все данные с сервера
      onProgress?.({ step: 'pulling', progress: 0 })
      const serverData = await syncApi.getFullSync()
      onProgress?.({ step: 'pulling', progress: 100 })

      // 3. Обновляем локальные данные
      onProgress?.({ step: 'applying', progress: 0 })
      await this.applyServerData(serverData)
      onProgress?.({ step: 'applying', progress: 100 })

      this.setLastSyncTime()
      this.notify('full_sync_completed', { timestamp: this.lastSyncTime })

      return { success: true, timestamp: this.lastSyncTime }
    } catch (error) {
      logError(error, { context: 'fullSync' })
      this.notify('full_sync_failed', { error: error.message })
      throw error
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Получить и применить дельта-изменения
   */
  async deltaSync() {
    if (!navigator.onLine || !this.lastSyncTime) {
      return null
    }

    try {
      // Отправляем локальные изменения
      await this.processQueue()

      // Получаем изменения с сервера
      const delta = await syncApi.getDelta(this.lastSyncTime.toISOString())
      
      if (delta.changes && delta.changes.length > 0) {
        await this.applyDeltaChanges(delta.changes)
      }

      this.setLastSyncTime(new Date(delta.timestamp))
      
      return { 
        success: true, 
        changesApplied: delta.changes?.length || 0 
      }
    } catch (error) {
      logError(error, { context: 'deltaSync' })
      throw error
    }
  }

  /**
   * Применить данные с сервера
   */
  async applyServerData(data) {
    // Эта функция должна обновить локальный store
    // Реализация зависит от структуры store
    const event = new CustomEvent('pos-sync-data', { detail: data })
    window.dispatchEvent(event)
  }

  /**
   * Применить дельта-изменения
   */
  async applyDeltaChanges(changes) {
    for (const change of changes) {
      const event = new CustomEvent('pos-sync-change', { detail: change })
      window.dispatchEvent(event)
    }
  }

  /**
   * Установить обработчик конфликтов
   */
  setConflictResolver(resolver) {
    this.conflictResolver = resolver
  }

  /**
   * Разрешить конфликт
   */
  async resolveConflict(conflict, resolution) {
    return syncApi.resolveConflict(conflict.id, resolution)
  }

  /**
   * Получить статус синхронизации
   */
  getStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      queueSize: this.syncQueue.length,
      isOnline: navigator.onLine
    }
  }

  /**
   * Очистить очередь синхронизации
   */
  clearQueue() {
    this.syncQueue = []
    this.saveQueue()
    this.notify('queue_cleared', {})
  }

  /**
   * Сбросить состояние синхронизации
   */
  reset() {
    this.clearQueue()
    localStorage.removeItem(LAST_SYNC_KEY)
    localStorage.removeItem(SYNC_VERSION_KEY)
    this.lastSyncTime = null
    this.notify('sync_reset', {})
  }
}

// Экспортируем singleton экземпляр
export const syncService = new SyncService()

// Автоматическая синхронизация при восстановлении соединения
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored, starting sync...')
    syncService.processQueue().catch(console.error)
  })
}

export default syncService
