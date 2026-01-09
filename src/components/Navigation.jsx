import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ShoppingCart, Package, BarChart3, Layers, Settings, Sparkles, Percent, MoreHorizontal, X } from 'lucide-react'

// Основные пункты (всегда видны)
const mainNavItems = [
  { id: 'pos', icon: ShoppingCart, label: 'Касса' },
  { id: 'products', icon: Package, label: 'Товары' },
  { id: 'catalog', icon: Sparkles, label: 'Каталог' },
  { id: 'reports', icon: BarChart3, label: 'Отчёты' },
]

// Дополнительные пункты (в меню "Ещё")
const moreNavItems = [
  { id: 'discounts', icon: Percent, label: 'Скидки' },
  { id: 'stock', icon: Layers, label: 'Склад' },
  { id: 'settings', icon: Settings, label: 'Настройки' },
]

export default function Navigation() {
  const { activePage, setActivePage, getCartCount } = useStore()
  const cartCount = getCartCount()
  const [showMore, setShowMore] = useState(false)

  // Проверяем, активна ли одна из дополнительных страниц
  const isMoreActive = moreNavItems.some(item => item.id === activePage)

  const handleNavClick = (id) => {
    setActivePage(id)
    setShowMore(false)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <>
      {/* Выпадающее меню "Ещё" - iOS стиль */}
      {showMore && (
        <>
          {/* Затемнение фона */}
          <div 
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setShowMore(false)}
          />
          
          {/* Меню - фиксировано над tab bar */}
          <div 
            className="fixed z-50 bottom-[85px] right-4 left-4 sm:left-auto sm:right-4 sm:w-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              {moreNavItems.map(({ id, icon: Icon, label }, index) => {
                const isActive = activePage === id
                return (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-4 transition-colors
                      ${isActive
                        ? 'bg-ios-blue/10 text-ios-blue'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      ${index !== moreNavItems.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                    `}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className="text-base font-medium">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* iOS Tab Bar - Fixed positioning for stability */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700"
        role="navigation"
        aria-label="Основная навигация"
      >
        <div 
          className="h-[56px] flex items-center justify-around max-w-lg mx-auto px-2" 
          role="tablist"
        >
          {mainNavItems.map(({ id, icon: Icon, label }) => {
            const isActive = activePage === id
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${label}${id === 'pos' && cartCount > 0 ? `, ${cartCount} товаров в корзине` : ''}`}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  flex-1 h-full ios-press
                  ${isActive ? 'text-ios-blue' : 'text-themed-tertiary'}
                `}
              >
                <div className="relative">
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="transition-all duration-200"
                  />
                  {/* iOS-style Badge */}
                  {id === 'pos' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-ios-red rounded-full text-[11px] font-semibold text-white flex items-center justify-center shadow-lg">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            )
          })}

          {/* Кнопка "Ещё" */}
          <button
            onClick={() => setShowMore(!showMore)}
            role="tab"
            aria-selected={isMoreActive}
            aria-label="Ещё"
            className={`
              relative flex flex-col items-center justify-center gap-0.5
              flex-1 h-full ios-press
              ${isMoreActive || showMore ? 'text-ios-blue' : 'text-themed-tertiary'}
            `}
          >
            <div className="relative">
              {showMore ? (
                <X size={24} strokeWidth={1.8} />
              ) : (
                <MoreHorizontal size={24} strokeWidth={1.8} />
              )}
              {/* Индикатор активности в подменю */}
              {isMoreActive && !showMore && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-ios-blue rounded-full" />
              )}
            </div>
            <span className={`text-[10px] tracking-wide ${isMoreActive ? 'font-semibold' : 'font-medium'}`}>
              Ещё
            </span>
          </button>
        </div>
        
        {/* Home Indicator (iPhone style) - Safe area */}
        <div className="flex justify-center pb-2 pt-1 safe-area-bottom">
          <div className="w-[134px] h-[5px] bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
      </nav>
    </>
  )
}
