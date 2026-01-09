import { useState, useEffect, useCallback } from 'react'

/**
 * Хук для отслеживания размеров окна браузера
 * @returns {{ width: number, height: number }} - Текущие размеры окна
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })

  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [])

  useEffect(() => {
    // Добавляем debounce для оптимизации
    let timeoutId = null
    
    const debouncedResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedResize)
    
    // Вызываем сразу для инициализации
    handleResize()

    return () => {
      window.removeEventListener('resize', debouncedResize)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [handleResize])

  return windowSize
}

/**
 * Хук для отслеживания размеров элемента
 * @param {React.RefObject} ref - Ссылка на элемент
 * @returns {{ width: number, height: number }} - Размеры элемента
 */
export function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return size
}

/**
 * Хук для определения мобильного устройства
 * @param {number} breakpoint - Точка перелома (по умолчанию 768px)
 * @returns {boolean} - true если мобильное устройство
 */
export function useIsMobile(breakpoint = 768) {
  const { width } = useWindowSize()
  return width < breakpoint
}

/**
 * Хук для определения ориентации экрана
 * @returns {'portrait' | 'landscape'} - Ориентация экрана
 */
export function useOrientation() {
  const { width, height } = useWindowSize()
  return height > width ? 'portrait' : 'landscape'
}

export default useWindowSize
