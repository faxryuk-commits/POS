/**
 * Enhanced Offline Indicator Component
 * Shows online/offline status with sync queue info
 */

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, CloudOff, RefreshCw, Check, AlertTriangle, Database } from 'lucide-react'
import { useOfflineIndicator, useStorageEstimate, useSync } from '../hooks/useOffline'

export default function OfflineIndicator() {
  const { show, isOnline, isSyncing, pending, message } = useOfflineIndicator()
  const { estimate } = useStorageEstimate()
  const { sync } = useSync()
  const [showDetails, setShowDetails] = useState(false)
  const [justSynced, setJustSynced] = useState(false)

  // Auto-hide after sync
  useEffect(() => {
    if (justSynced) {
      const timer = setTimeout(() => setJustSynced(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [justSynced])

  const handleSync = async () => {
    const result = await sync()
    if (result.success) {
      setJustSynced(true)
    }
  }

  // Don't show if online and no pending sync
  if (!show && !showDetails) return null

  return (
    <>
      {/* Main indicator bar */}
      <div 
        className={`
          fixed top-0 left-0 right-0 z-[100] transition-all duration-300
          ${!isOnline ? 'bg-ios-orange' : pending > 0 ? 'bg-ios-blue' : 'bg-ios-green'}
        `}
        onClick={() => setShowDetails(true)}
      >
        <div className="safe-area-top" />
        <div className="flex items-center justify-center gap-2 py-1.5 px-4 cursor-pointer">
          {!isOnline ? (
            <>
              <WifiOff size={14} className="text-white" />
              <span className="text-xs font-medium text-white">Офлайн режим</span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw size={14} className="text-white animate-spin" />
              <span className="text-xs font-medium text-white">Синхронизация...</span>
            </>
          ) : justSynced ? (
            <>
              <Check size={14} className="text-white" />
              <span className="text-xs font-medium text-white">Синхронизировано</span>
            </>
          ) : pending > 0 ? (
            <>
              <CloudOff size={14} className="text-white" />
              <span className="text-xs font-medium text-white">
                {pending} {pending === 1 ? 'изменение' : pending < 5 ? 'изменения' : 'изменений'} ожидает синхронизации
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Details modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-ios-slide-up sm:animate-ios-spring">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isOnline ? 'bg-ios-green/20' : 'bg-ios-orange/20'}
                `}>
                  {isOnline ? (
                    <Wifi size={20} className="text-ios-green" />
                  ) : (
                    <WifiOff size={20} className="text-ios-orange" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isOnline ? 'Подключено' : 'Офлайн режим'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isOnline ? 'Интернет доступен' : 'Данные сохраняются локально'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Sync status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <CloudOff size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ожидает синхронизации</span>
                </div>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${pending > 0 ? 'bg-ios-orange/20 text-ios-orange' : 'bg-ios-green/20 text-ios-green'}
                `}>
                  {pending}
                </span>
              </div>

              {/* Storage info */}
              {estimate && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Локальное хранилище</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{estimate.formatted.usage} использовано</span>
                      <span>{estimate.formatted.available} свободно</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-ios-blue rounded-full transition-all"
                        style={{ width: `${Math.min(estimate.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-ios-blue/10 rounded-xl">
                <AlertTriangle size={16} className="text-ios-blue flex-shrink-0 mt-0.5" />
                <p className="text-xs text-ios-blue">
                  {isOnline 
                    ? 'Все данные автоматически синхронизируются с сервером при подключении к интернету.'
                    : 'В офлайн режиме все изменения сохраняются локально и будут синхронизированы при восстановлении связи.'
                  }
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 h-11 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Закрыть
              </button>
              {isOnline && pending > 0 && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex-1 h-11 bg-ios-blue text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Синхронизация...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Синхронизировать
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Compact offline badge (for header)
 */
export function OfflineBadge() {
  const { isOnline, pending } = useOfflineIndicator()

  if (isOnline && pending === 0) return null

  return (
    <div className={`
      px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
      ${!isOnline ? 'bg-ios-orange/20 text-ios-orange' : 'bg-ios-blue/20 text-ios-blue'}
    `}>
      {!isOnline ? (
        <>
          <WifiOff size={12} />
          <span>Офлайн</span>
        </>
      ) : (
        <>
          <CloudOff size={12} />
          <span>{pending}</span>
        </>
      )}
    </div>
  )
}
