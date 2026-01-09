import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { 
  ChevronRight, ChevronLeft, X, ShoppingCart, Package, 
  Layers, BarChart3, Settings, ScanBarcode, CreditCard,
  Sparkles, Rocket, CheckCircle2
} from 'lucide-react'

const steps = [
  {
    id: 'welcome',
    title: 'Добро пожаловать! 🎉',
    description: 'Быстрый тур по POS системе. Займёт 1 минуту.',
    icon: Rocket,
    page: 'pos'
  },
  {
    id: 'pos',
    title: 'Касса',
    description: 'Нажимайте на товары чтобы добавить в корзину. Категории помогут найти нужное.',
    icon: ShoppingCart,
    page: 'pos'
  },
  {
    id: 'scanner',
    title: 'Сканер',
    description: 'Кнопка сканера справа от поиска. Используйте камеру или введите штрих-код вручную.',
    icon: ScanBarcode,
    page: 'pos'
  },
  {
    id: 'cart',
    title: 'Корзина',
    description: 'Справа — корзина и кнопка оплаты. Поддерживается оплата наличными и картой.',
    icon: CreditCard,
    page: 'pos'
  },
  {
    id: 'products',
    title: 'Товары',
    description: 'Добавляйте товары, редактируйте цены и штрих-коды.',
    icon: Package,
    page: 'products'
  },
  {
    id: 'stock',
    title: 'Склад',
    description: 'Приход от поставщиков и списание. Контроль остатков.',
    icon: Layers,
    page: 'stock'
  },
  {
    id: 'reports',
    title: 'Отчёты',
    description: 'Выручка, топ продаж, история чеков. Повторная печать.',
    icon: BarChart3,
    page: 'reports'
  },
  {
    id: 'settings',
    title: 'Настройки',
    description: 'Валюта (13 стран СНГ), кассиры, чеки, данные магазина.',
    icon: Settings,
    page: 'settings'
  },
  {
    id: 'complete',
    title: 'Готово! ✓',
    description: 'Все данные сохраняются локально. Работает без интернета.',
    icon: CheckCircle2,
    page: 'pos'
  }
]

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const { setActivePage } = useStore()

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1

  useEffect(() => {
    if (step.page) {
      setActivePage(step.page)
    }
  }, [currentStep, step.page, setActivePage])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem('pos-onboarding-completed', 'true')
    setActivePage('pos')
    setTimeout(() => onComplete?.(), 200)
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isVisible) return null

  const Icon = step.icon

  return (
    <>
      {/* Компактная панель онбординга внизу */}
      <div 
        className={`
          fixed bottom-24 left-4 right-4 z-[100] 
          transition-all duration-300 transform
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}
      >
        <div className="max-w-lg mx-auto">
          {/* Прогресс бар */}
          <div className="h-1 bg-themed-tertiary rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-ios-blue transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Карточка подсказки */}
          <div className="ios-glass-elevated rounded-ios-xl border border-themed shadow-ios-lg overflow-hidden">
            <div className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                {/* Иконка - скрыта на мобильном */}
                <div className="hidden sm:flex flex-shrink-0 w-10 h-10 bg-ios-blue/20 rounded-ios-lg items-center justify-center">
                  <Icon size={20} className="text-ios-blue" />
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-themed-primary text-sm sm:text-base flex items-center gap-2">
                      <Icon size={16} className="text-ios-blue sm:hidden" />
                      {step.title}
                    </h3>
                    <span className="text-xs text-themed-tertiary ml-2">
                      {currentStep + 1}/{steps.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-themed-secondary leading-relaxed line-clamp-2">
                    {step.description}
                  </p>
                </div>

                {/* Кнопка закрытия */}
                <button
                  onClick={handleSkip}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-themed-tertiary hover:text-themed-primary hover:bg-fill-tertiary rounded-ios transition-colors -mt-1 -mr-1 ios-press"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Кнопки навигации */}
              <div className="flex items-center gap-2 mt-3">
                {/* Точки */}
                <div className="flex-1 flex items-center gap-1">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`
                        h-1 sm:h-1.5 rounded-full transition-all duration-300 ios-press
                        ${idx === currentStep 
                          ? 'w-4 sm:w-6 bg-ios-blue' 
                          : idx < currentStep 
                            ? 'w-1 sm:w-1.5 bg-ios-blue/50' 
                            : 'w-1 sm:w-1.5 bg-fill-tertiary hover:bg-fill-secondary'
                        }
                      `}
                    />
                  ))}
                </div>

                {/* Кнопки */}
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="h-8 px-2 sm:px-3 bg-fill-tertiary rounded-ios text-themed-secondary hover:bg-fill-secondary hover:text-themed-primary transition-all flex items-center gap-1 ios-press"
                    >
                      <ChevronLeft size={14} />
                      <span className="text-xs sm:text-sm hidden sm:inline">Назад</span>
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="h-8 px-3 sm:px-4 bg-ios-blue rounded-ios font-medium text-white hover:bg-ios-blue/90 transition-all flex items-center gap-1 ios-press shadow-ios"
                  >
                    <span className="text-xs sm:text-sm">
                      {isLastStep ? 'Готово' : 'Далее'}
                    </span>
                    {isLastStep ? (
                      <Sparkles size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
