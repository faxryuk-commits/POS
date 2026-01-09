/**
 * React hooks for offline functionality
 */

import { useState, useEffect, useCallback } from 'react'
import { syncService, syncQueue, getStorageEstimate, SYNC_STATUS } from '../services/offlineStorage'

/**
 * Hook for online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastOnline, setLastOnline] = useState(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, lastOnline }
}

/**
 * Hook for sync status and actions
 */
export function useSync() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    pending: 0,
    failed: 0,
  })

  // Load initial status
  useEffect(() => {
    const loadStatus = async () => {
      const syncStatus = await syncService.getStatus()
      setStatus(syncStatus)
    }
    loadStatus()

    // Subscribe to sync events
    const unsubscribe = syncService.subscribe((event) => {
      if (event.type === 'online' || event.type === 'offline') {
        setStatus(prev => ({ ...prev, isOnline: event.type === 'online' }))
      }
      if (event.type === 'sync_start') {
        setStatus(prev => ({ ...prev, isSyncing: true }))
      }
      if (event.type === 'sync_complete' || event.type === 'sync_error') {
        loadStatus()
      }
      if (event.type === 'queued') {
        loadStatus()
      }
    })

    return unsubscribe
  }, [])

  // Manual sync trigger
  const sync = useCallback(async () => {
    return syncService.sync()
  }, [])

  // Queue transaction
  const queueTransaction = useCallback(async (transaction) => {
    await syncService.queueTransaction(transaction)
    const newStatus = await syncService.getStatus()
    setStatus(newStatus)
  }, [])

  return {
    ...status,
    sync,
    queueTransaction,
    hasPendingSync: status.pending > 0,
  }
}

/**
 * Hook for storage estimate
 */
export function useStorageEstimate() {
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEstimate = async () => {
      setLoading(true)
      try {
        const est = await getStorageEstimate()
        setEstimate(est)
      } catch (error) {
        console.error('Failed to get storage estimate:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEstimate()
  }, [])

  return { estimate, loading }
}

/**
 * Hook for pending sync items
 */
export function usePendingSync() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const items = await syncQueue.getPending()
      setPending(items)
    } catch (error) {
      console.error('Failed to get pending sync items:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    // Subscribe to changes
    const unsubscribe = syncService.subscribe((event) => {
      if (['queued', 'sync_complete'].includes(event.type)) {
        refresh()
      }
    })

    return unsubscribe
  }, [refresh])

  return { pending, loading, refresh }
}

/**
 * Offline indicator component data
 */
export function useOfflineIndicator() {
  const { isOnline } = useOnlineStatus()
  const { pending, isSyncing } = useSync()

  return {
    show: !isOnline || pending > 0,
    isOnline,
    isSyncing,
    pending,
    message: !isOnline 
      ? 'Офлайн режим' 
      : pending > 0 
        ? `Ожидает синхронизации: ${pending}` 
        : null,
  }
}
