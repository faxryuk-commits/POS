import React from 'react'
import { Download, RefreshCw, Wifi, WifiOff, X, Smartphone } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import { useOffline } from '../hooks/useOffline'

/**
 * Баннер для PWA функциональности
 * Показывает статус офлайн, предложение установки и обновления
 */
export default function PWABanner() {
  const { 
    needRefresh, 
    offlineReady, 
    updateServiceWorker, 
    isInstallable, 
    installApp 
  } = usePWA()
  
  const { isOnline } = useOffline()
  const [dismissed, setDismissed] = React.useState({
    offline: false,
    update: false,
    install: false
  })

  const dismiss = (type) => {
    setDismissed(prev => ({ ...prev, [type]: true }))
  }

  // Показать баннер "готово к офлайн"
  if (offlineReady && !dismissed.offline) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-slide-up">
        <div className="bg-ios-green text-white rounded-ios-xl p-4 shadow-ios-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <WifiOff size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Офлайн режим готов</div>
            <div className="text-xs text-white/80 mt-0.5">
              Приложение будет работать без интернета
            </div>
          </div>
          <button
            onClick={() => dismiss('offline')}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )
  }

  // Показать баннер обновления
  if (needRefresh && !dismissed.update) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-slide-up">
        <div className="bg-ios-blue text-white rounded-ios-xl p-4 shadow-ios-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <RefreshCw size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Доступно обновление</div>
              <div className="text-xs text-white/80 mt-0.5">
                Новая версия приложения готова к установке
              </div>
            </div>
            <button
              onClick={() => dismiss('update')}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => dismiss('update')}
              className="flex-1 py-2 px-3 bg-white/20 rounded-ios text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Позже
            </button>
            <button
              onClick={updateServiceWorker}
              className="flex-1 py-2 px-3 bg-white rounded-ios text-ios-blue text-sm font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={16} />
              Обновить
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Показать баннер установки
  if (isInstallable && !dismissed.install) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-slide-up">
        <div className="bg-gradient-to-r from-ios-purple to-ios-blue text-white rounded-ios-xl p-4 shadow-ios-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Установить приложение</div>
              <div className="text-xs text-white/80 mt-0.5">
                Добавьте POS на главный экран для быстрого доступа
              </div>
            </div>
            <button
              onClick={() => dismiss('install')}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => dismiss('install')}
              className="flex-1 py-2 px-3 bg-white/20 rounded-ios text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Не сейчас
            </button>
            <button
              onClick={installApp}
              className="flex-1 py-2 px-3 bg-white rounded-ios text-ios-purple text-sm font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={16} />
              Установить
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Компактный индикатор статуса подключения
 */
export function ConnectionStatus() {
  const { isOnline, offlineQueueCount } = useOffline()
  
  if (isOnline && offlineQueueCount === 0) return null

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      ${isOnline 
        ? 'bg-ios-orange/20 text-ios-orange' 
        : 'bg-ios-red/20 text-ios-red'
      }
    `}>
      {isOnline ? (
        <>
          <Wifi size={12} className="animate-pulse" />
          <span>Синхронизация ({offlineQueueCount})</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Офлайн</span>
        </>
      )}
    </div>
  )
}
