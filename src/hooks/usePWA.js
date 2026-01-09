import { useState, useEffect, useCallback } from 'react'
import { registerSW } from 'virtual:pwa-register'

/**
 * Хук для работы с PWA функциональностью
 * 
 * Возвращает:
 * - needRefresh: требуется обновление
 * - offlineReady: приложение готово к офлайн работе
 * - updateServiceWorker: функция для обновления
 * - isInstallable: можно установить как приложение
 * - installApp: функция установки
 */
export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Проверяем, установлено ли приложение
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Регистрируем Service Worker
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
        console.log('📦 Доступно обновление приложения')
      },
      onOfflineReady() {
        setOfflineReady(true)
        console.log('✅ Приложение готово к офлайн работе')
      },
      onRegisteredSW(swUrl, r) {
        setRegistration(r)
        console.log('🔧 Service Worker зарегистрирован:', swUrl)
        
        // Периодическая проверка обновлений (каждый час)
        if (r) {
          setInterval(() => {
            r.update()
          }, 60 * 60 * 1000)
        }
      },
      onRegisterError(error) {
        console.error('❌ Ошибка регистрации Service Worker:', error)
      }
    })

    // Обработчик события установки PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      console.log('📲 Приложение можно установить')
    }

    // Обработчик успешной установки
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      console.log('✅ Приложение установлено')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Функция обновления приложения
  const updateServiceWorker = useCallback(async () => {
    if (registration && registration.waiting) {
      // Отправляем сообщение waiting SW для активации
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Перезагружаем страницу после активации нового SW
      registration.waiting.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') {
          window.location.reload()
        }
      })
    } else {
      // Просто перезагружаем для получения обновлений
      window.location.reload()
    }
  }, [registration])

  // Функция установки приложения
  const installApp = useCallback(async () => {
    if (!installPrompt) {
      console.warn('Установка недоступна')
      return false
    }

    try {
      const result = await installPrompt.prompt()
      console.log('Результат установки:', result.outcome)
      
      if (result.outcome === 'accepted') {
        setInstallPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка установки:', error)
      return false
    }
  }, [installPrompt])

  // Функция очистки кэша
  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('🗑️ Кэш очищен')
      return true
    }
    return false
  }, [])

  // Получение информации о кэше
  const getCacheInfo = useCallback(async () => {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const cacheNames = await caches.keys()
      
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercent: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0,
        caches: cacheNames
      }
    }
    return null
  }, [])

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    isInstallable: !!installPrompt && !isInstalled,
    isInstalled,
    installApp,
    clearCache,
    getCacheInfo
  }
}

export default usePWA
