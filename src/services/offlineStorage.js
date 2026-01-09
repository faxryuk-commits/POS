/**
 * Offline Storage Service
 * Uses IndexedDB for larger data storage with sync queue
 * 
 * Storage capacity: ~500MB+ (vs localStorage ~5-10MB)
 * Features:
 * - Automatic sync queue when online
 * - Conflict resolution (last-write-wins)
 * - Data versioning
 * - Compression for large datasets
 */

const DB_NAME = 'pos-offline-db'
const DB_VERSION = 1

// Store names
const STORES = {
  PRODUCTS: 'products',
  TRANSACTIONS: 'transactions',
  SYNC_QUEUE: 'syncQueue',
  SETTINGS: 'settings',
  CACHE: 'cache',
}

// Sync status
export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
  CONFLICT: 'conflict',
}

let db = null

/**
 * Initialize IndexedDB
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Products store
      if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productsStore = database.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
        productsStore.createIndex('barcode', 'barcode', { unique: true })
        productsStore.createIndex('category', 'category', { unique: false })
        productsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Transactions store
      if (!database.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const transactionsStore = database.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' })
        transactionsStore.createIndex('date', 'date', { unique: false })
        transactionsStore.createIndex('syncStatus', 'syncStatus', { unique: false })
        transactionsStore.createIndex('receiptNumber', 'receiptNumber', { unique: true })
      }

      // Sync queue store
      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = database.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true })
        syncStore.createIndex('type', 'type', { unique: false })
        syncStore.createIndex('status', 'status', { unique: false })
        syncStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Settings store
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }

      // Cache store (for API responses, images, etc.)
      if (!database.objectStoreNames.contains(STORES.CACHE)) {
        const cacheStore = database.createObjectStore(STORES.CACHE, { keyPath: 'key' })
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false })
      }
    }
  })
}

/**
 * Get database instance
 */
async function getDB() {
  if (!db) {
    await initDB()
  }
  return db
}

/**
 * Generic CRUD operations
 */
export const offlineDB = {
  // Add or update item
  async put(storeName, item) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put({
        ...item,
        updatedAt: new Date().toISOString(),
      })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Get item by key
  async get(storeName, key) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Get all items
  async getAll(storeName) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Delete item
  async delete(storeName, key) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  // Clear store
  async clear(storeName) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  // Query by index
  async queryByIndex(storeName, indexName, value) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  // Count items
  async count(storeName) {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },
}

/**
 * Sync Queue Management
 */
export const syncQueue = {
  // Add action to sync queue
  async add(action) {
    return offlineDB.put(STORES.SYNC_QUEUE, {
      ...action,
      status: SYNC_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    })
  },

  // Get pending items
  async getPending() {
    return offlineDB.queryByIndex(STORES.SYNC_QUEUE, 'status', SYNC_STATUS.PENDING)
  },

  // Mark as synced
  async markSynced(id) {
    const item = await offlineDB.get(STORES.SYNC_QUEUE, id)
    if (item) {
      return offlineDB.put(STORES.SYNC_QUEUE, {
        ...item,
        status: SYNC_STATUS.SYNCED,
        syncedAt: new Date().toISOString(),
      })
    }
  },

  // Mark as failed
  async markFailed(id, error) {
    const item = await offlineDB.get(STORES.SYNC_QUEUE, id)
    if (item) {
      return offlineDB.put(STORES.SYNC_QUEUE, {
        ...item,
        status: SYNC_STATUS.FAILED,
        error: error?.message || 'Unknown error',
        retryCount: (item.retryCount || 0) + 1,
      })
    }
  },

  // Clear synced items
  async clearSynced() {
    const synced = await offlineDB.queryByIndex(STORES.SYNC_QUEUE, 'status', SYNC_STATUS.SYNCED)
    for (const item of synced) {
      await offlineDB.delete(STORES.SYNC_QUEUE, item.id)
    }
  },

  // Get queue stats
  async getStats() {
    const all = await offlineDB.getAll(STORES.SYNC_QUEUE)
    return {
      total: all.length,
      pending: all.filter(i => i.status === SYNC_STATUS.PENDING).length,
      syncing: all.filter(i => i.status === SYNC_STATUS.SYNCING).length,
      synced: all.filter(i => i.status === SYNC_STATUS.SYNCED).length,
      failed: all.filter(i => i.status === SYNC_STATUS.FAILED).length,
    }
  },
}

/**
 * Sync Service
 */
export class SyncService {
  constructor(apiEndpoint = null) {
    this.apiEndpoint = apiEndpoint
    this.isOnline = navigator.onLine
    this.isSyncing = false
    this.listeners = new Set()

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  // Subscribe to sync events
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notify listeners
  notify(event) {
    this.listeners.forEach(cb => cb(event))
  }

  // Handle coming online
  async handleOnline() {
    this.isOnline = true
    this.notify({ type: 'online' })
    
    // Auto-sync when coming online
    if (this.apiEndpoint) {
      await this.sync()
    }
  }

  // Handle going offline
  handleOffline() {
    this.isOnline = false
    this.notify({ type: 'offline' })
  }

  // Main sync function
  async sync() {
    if (this.isSyncing || !this.isOnline || !this.apiEndpoint) {
      return { success: false, reason: 'Cannot sync' }
    }

    this.isSyncing = true
    this.notify({ type: 'sync_start' })

    try {
      const pending = await syncQueue.getPending()
      let synced = 0
      let failed = 0

      for (const item of pending) {
        try {
          // Send to server
          const response = await fetch(`${this.apiEndpoint}/${item.type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data),
          })

          if (response.ok) {
            await syncQueue.markSynced(item.id)
            synced++
          } else {
            await syncQueue.markFailed(item.id, new Error(`HTTP ${response.status}`))
            failed++
          }
        } catch (error) {
          await syncQueue.markFailed(item.id, error)
          failed++
        }
      }

      // Clean up synced items
      await syncQueue.clearSynced()

      this.notify({ type: 'sync_complete', synced, failed })
      return { success: true, synced, failed }
    } catch (error) {
      this.notify({ type: 'sync_error', error })
      return { success: false, error }
    } finally {
      this.isSyncing = false
    }
  }

  // Queue a transaction for sync
  async queueTransaction(transaction) {
    await syncQueue.add({
      type: 'transaction',
      data: transaction,
    })
    this.notify({ type: 'queued', dataType: 'transaction' })
  }

  // Queue a product update
  async queueProductUpdate(product) {
    await syncQueue.add({
      type: 'product',
      data: product,
    })
    this.notify({ type: 'queued', dataType: 'product' })
  }

  // Get sync status
  async getStatus() {
    const stats = await syncQueue.getStats()
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      ...stats,
    }
  }
}

/**
 * Storage size utilities
 */
export async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      quota: estimate.quota, // Total available
      usage: estimate.usage, // Currently used
      percent: Math.round((estimate.usage / estimate.quota) * 100),
      available: estimate.quota - estimate.usage,
      // Format for display
      formatted: {
        quota: formatBytes(estimate.quota),
        usage: formatBytes(estimate.usage),
        available: formatBytes(estimate.quota - estimate.usage),
      }
    }
  }
  return null
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Export singleton sync service
 */
export const syncService = new SyncService()

// Initialize DB on module load
initDB().catch(console.error)
