import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import POSScreen from './pages/POSScreen'
import ProductsScreen from './pages/ProductsScreen'
import CatalogScreen from './pages/CatalogScreen'
import DiscountsScreen from './pages/DiscountsScreen'
import StockScreen from './pages/StockScreen'
import ReportsScreen from './pages/ReportsScreen'
import SettingsScreen from './pages/SettingsScreen'
import Navigation from './components/Navigation'
import PinLogin from './components/PinLogin'
import BarcodeScanner from './components/BarcodeScanner'
import Onboarding from './components/Onboarding'
import { HelpProvider } from './components/HelpSystem'
import { ErrorBoundary } from './components/ErrorBoundary'
import OfflineIndicator from './components/OfflineIndicator'
import { ThemeProvider, ThemeToggleCompact } from './components/ThemeProvider'
import { ConfirmProvider, InputDialogProvider, UndoToastProvider, StatusToastProvider } from './components/ConfirmDialog'
import PWABanner from './components/PWABanner'
import { useFullscreen } from './hooks/useFullscreen'
import { Maximize2, Minimize2 } from 'lucide-react'

function App() {
  const { 
    activePage, 
    isAuthenticated, 
    showPinModal,
    currentCashier,
    isScannerOpen,
    setScannerOpen,
    getCurrency,
    settings,
    showOnboarding,
    setShowOnboarding
  } = useStore()

  const currency = getCurrency()
  
  // Полноэкранный режим
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen()
  
  // Состояние для обновления времени
  const [currentTime, setCurrentTime] = useState(new Date())

  // Проверяем нужно ли показывать онбординг
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('pos-onboarding-completed')
    const isFirstVisit = !localStorage.getItem('pos-visited')
    if (!onboardingCompleted && isAuthenticated && isFirstVisit) {
      localStorage.setItem('pos-visited', 'true')
      setShowOnboarding(true)
    }
  }, [isAuthenticated])

  // Обновляем время каждую секунду для более точного отображения
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Показываем экран авторизации
  if (!isAuthenticated || showPinModal) {
    return <PinLogin />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'pos':
        return <POSScreen />
      case 'products':
        return <ProductsScreen />
      case 'catalog':
        return <CatalogScreen />
      case 'discounts':
        return <DiscountsScreen />
      case 'stock':
        return <StockScreen />
      case 'reports':
        return <ReportsScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <POSScreen />
    }
  }

  // Форматирование времени в iOS стиле
  const formatTime = () => {
    return currentTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <ThemeProvider>
      <ConfirmProvider>
        <InputDialogProvider>
        <UndoToastProvider>
        <StatusToastProvider>
        <ErrorBoundary onReset={() => useStore.getState().setActivePage('pos')}>
          <HelpProvider>
          {/* Индикатор офлайн-режима */}
          <OfflineIndicator />
          <PWABanner />
          
          <div className="h-full flex flex-col bg-themed-primary">
            {/* iOS Status Bar Style Header */}
            <header className="flex-shrink-0 ios-glass-thick border-b border-themed safe-area-top">
              {/* Status Bar */}
              <div className="h-12 flex items-center justify-between px-4">
                {/* Left: Logo & Store Name */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-ios-blue to-ios-purple rounded-ios-lg flex items-center justify-center shadow-ios">
                    <span className="text-base font-bold text-white">💳</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-[15px] font-semibold text-themed-primary leading-tight">
                      {settings?.storeName || 'POS System'}
                    </h1>
                    <div className="flex items-center gap-1.5 text-[11px] text-themed-secondary">
                      <span className="w-1.5 h-1.5 bg-ios-green rounded-full animate-pulse" />
                      {currentCashier?.name}
                    </div>
                  </div>
                  <span className="text-lg sm:hidden">💳</span>
                </div>

                {/* Center: Store name on mobile */}
                <div className="sm:hidden text-[17px] font-semibold text-themed-primary">
                  {settings?.storeName || 'Касса'}
                </div>

                {/* Right: Fullscreen, Theme Toggle, Time & Date */}
                <div className="flex items-center gap-2">
                  {/* Fullscreen Button */}
                  {isSupported && (
                    <button
                      onClick={toggleFullscreen}
                      className="w-8 h-8 rounded-ios flex items-center justify-center text-themed-secondary hover:text-ios-blue hover:bg-ios-blue/10 transition-colors"
                      title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                    >
                      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                  )}
                  <ThemeToggleCompact className="hidden sm:flex" />
                  <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-themed-secondary">
                    <span>{currency.flag}</span>
                    <span>{formatDate()}</span>
                  </div>
                  <div className="text-[15px] font-medium text-themed-primary tabular-nums">
                    {formatTime()}
                  </div>
                </div>
              </div>
            </header>

            {/* Основной контент - с padding для фиксированной навигации */}
            <main className="flex-1 overflow-hidden bg-themed-primary pb-[80px]">
              {renderPage()}
            </main>

            {/* iOS Tab Bar - Fixed */}
            <Navigation />

            {/* Сканер штрих-кодов */}
            {isScannerOpen && (
              <BarcodeScanner
                onClose={() => setScannerOpen(false)}
                onScan={() => {
                  // Товар уже добавлен в корзину внутри сканера
                }}
              />
            )}

            {/* Онбординг */}
            {showOnboarding && (
              <Onboarding onComplete={() => setShowOnboarding(false)} />
            )}
          </div>
          </HelpProvider>
        </ErrorBoundary>
        </StatusToastProvider>
        </UndoToastProvider>
        </InputDialogProvider>
      </ConfirmProvider>
    </ThemeProvider>
  )
}

export default App
