import { useState, useEffect, useCallback } from 'react'

/**
 * Хук для управления полноэкранным режимом
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Проверка поддержки
  const isSupported = typeof document !== 'undefined' && (
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled
  )

  // Обновление состояния при изменении fullscreen
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.mozFullScreenElement ||
        !!document.msFullscreenElement
      )
    }

    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
    document.addEventListener('mozfullscreenchange', handleChange)
    document.addEventListener('MSFullscreenChange', handleChange)

    // Проверяем начальное состояние
    handleChange()

    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
      document.removeEventListener('webkitfullscreenchange', handleChange)
      document.removeEventListener('mozfullscreenchange', handleChange)
      document.removeEventListener('MSFullscreenChange', handleChange)
    }
  }, [])

  // Войти в полноэкранный режим
  const enterFullscreen = useCallback(async () => {
    const elem = document.documentElement

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen()
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error)
    }
  }, [])

  // Выйти из полноэкранного режима
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error)
    }
  }, [])

  // Переключение
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  }
}
