import { useEffect } from 'react'
import { useStore } from '../store/useStore'

/**
 * Theme Provider Component
 * Manages light/dark theme based on settings and system preference
 */
export function ThemeProvider({ children }) {
  const { settings } = useStore()
  const theme = settings?.theme || 'system'

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    const applyTheme = (isDark) => {
      if (isDark) {
        root.setAttribute('data-theme', 'dark')
        root.classList.add('dark')
        body.classList.add('dark')
      } else {
        root.setAttribute('data-theme', 'light')
        root.classList.remove('dark')
        body.classList.remove('dark')
      }
    }

    if (theme === 'dark') {
      applyTheme(true)
    } else if (theme === 'light') {
      applyTheme(false)
    } else {
      // System preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      const handler = (e) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  return children
}

/**
 * Theme Toggle Component
 * iOS-style theme switcher
 */
export function ThemeToggle({ className = '' }) {
  const { settings, updateSettings } = useStore()
  const theme = settings?.theme || 'system'

  const themes = [
    { id: 'light', icon: '☀️', label: 'Светлая' },
    { id: 'dark', icon: '🌙', label: 'Тёмная' },
    { id: 'system', icon: '⚙️', label: 'Система' },
  ]

  return (
    <div className={`flex gap-1 p-1 bg-fill-themed rounded-ios ${className}`}>
      {themes.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => updateSettings({ theme: id })}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-ios text-ios-subhead font-medium transition-all ios-press
            ${theme === id
              ? 'bg-themed-secondary text-themed-primary shadow-ios'
              : 'text-themed-secondary hover:text-themed-primary'
            }
          `}
        >
          <span>{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Compact Theme Toggle (for header)
 */
export function ThemeToggleCompact({ className = '' }) {
  const { settings, updateSettings } = useStore()
  const theme = settings?.theme || 'system'

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    updateSettings({ theme: next })
  }

  const icons = { light: '☀️', dark: '🌙', system: '⚙️' }

  return (
    <button
      onClick={cycleTheme}
      className={`w-10 h-10 flex items-center justify-center rounded-ios bg-fill-themed text-xl ios-press ${className}`}
      title={`Тема: ${theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Система'}`}
    >
      {icons[theme]}
    </button>
  )
}

export default ThemeProvider
