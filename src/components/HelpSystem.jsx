import { useState, createContext, useContext } from 'react'
import { HelpCircle, X, ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, Info } from 'lucide-react'

// Контекст для системы помощи
const HelpContext = createContext()

// Данные обучения по модулям
const moduleHelp = {
  pos: {
    title: 'Касса',
    icon: '🛒',
    tips: [
      { title: 'Добавление товаров', text: 'Нажмите на карточку товара чтобы добавить его в корзину. Повторное нажатие увеличит количество.' },
      { title: 'Категории', text: 'Используйте кнопки категорий для быстрой фильтрации товаров.' },
      { title: 'Сканер', text: 'Нажмите кнопку сканера справа от поиска для сканирования штрих-кода камерой.' },
      { title: 'Оплата', text: 'Выберите способ оплаты: наличные или карта. При наличных — введите сумму для расчёта сдачи.' },
      { title: 'Корзина', text: 'Изменяйте количество кнопками +/-, удаляйте товары крестиком, очищайте корзину иконкой корзины.' },
    ]
  },
  products: {
    title: 'Товары',
    icon: '📦',
    tips: [
      { title: 'Добавление', text: 'Нажмите "+ Добавить товар" для создания нового товара.' },
      { title: 'Редактирование', text: 'Нажмите иконку карандаша для редактирования товара.' },
      { title: 'Удаление', text: 'Нажмите иконку корзины для удаления. Удаление необратимо!' },
      { title: 'Штрих-код', text: 'Генерируется автоматически, но вы можете ввести свой код товара.' },
      { title: 'Остатки', text: 'Красный — нет в наличии, жёлтый — заканчивается (≤5 шт).' },
    ]
  },
  stock: {
    title: 'Склад',
    icon: '📋',
    tips: [
      { title: 'Приход', text: 'Вкладка "Приход" — оформление поступления товаров от поставщика.' },
      { title: 'Расход', text: 'Вкладка "Расход" — списание товаров (брак, истёк срок и т.д.).' },
      { title: 'Количество', text: 'Укажите количество и причину движения для учёта.' },
      { title: 'История', text: 'Все движения сохраняются в истории с датой и кассиром.' },
      { title: 'Стоимость', text: 'Сумма склада рассчитывается как цена × остаток по всем товарам.' },
    ]
  },
  reports: {
    title: 'Отчёты',
    icon: '📊',
    tips: [
      { title: 'Выручка', text: 'Показывает общую выручку за сегодня и за неделю.' },
      { title: 'Топ продаж', text: 'Список самых продаваемых товаров по количеству.' },
      { title: 'Средний чек', text: 'Рассчитывается как выручка ÷ количество продаж.' },
      { title: 'История чеков', text: 'Нажмите на чек для просмотра деталей и повторной печати.' },
      { title: 'Графики', text: 'Визуализация выручки по дням недели.' },
    ]
  },
  settings: {
    title: 'Настройки',
    icon: '⚙️',
    tips: [
      { title: 'Валюта', text: 'Выберите валюту из 13 стран СНГ. Все цены отобразятся в новой валюте.' },
      { title: 'Кассиры', text: 'Добавляйте кассиров с уникальными PIN-кодами.' },
      { title: 'Чеки', text: 'Настройте текст в конце чека и данные магазина.' },
      { title: 'Сброс', text: 'В разделе "Данные" можно сбросить демо-данные или удалить всё.' },
      { title: 'Обучение', text: 'Кнопка "Начать обучение" запустит тур по системе заново.' },
    ]
  }
}

// Провайдер контекста
export function HelpProvider({ children }) {
  const [activeModule, setActiveModule] = useState(null)
  const [currentTip, setCurrentTip] = useState(0)

  const openHelp = (module) => {
    setActiveModule(module)
    setCurrentTip(0)
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const closeHelp = () => {
    setActiveModule(null)
    setCurrentTip(0)
  }

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp, activeModule }}>
      {children}
      {activeModule && (
        <HelpModal 
          module={activeModule} 
          currentTip={currentTip}
          setCurrentTip={setCurrentTip}
          onClose={closeHelp} 
        />
      )}
    </HelpContext.Provider>
  )
}

// Хук для использования системы помощи
export function useHelp() {
  return useContext(HelpContext)
}

// iOS-style Help Button
export function HelpButton({ module, className = '' }) {
  const { openHelp } = useHelp()
  
  return (
    <button
      onClick={() => openHelp(module)}
      className={`w-[44px] h-[44px] flex items-center justify-center rounded-ios bg-fill-tertiary hover:bg-fill-secondary text-themed-secondary hover:text-ios-blue transition-all ios-press ${className}`}
      title="Помощь"
    >
      <HelpCircle size={22} />
    </button>
  )
}

// iOS-style Help Modal
function HelpModal({ module, currentTip, setCurrentTip, onClose }) {
  const help = moduleHelp[module]
  if (!help) return null

  const tip = help.tips[currentTip]
  const isFirst = currentTip === 0
  const isLast = currentTip === help.tips.length - 1

  const nextTip = () => {
    if (isLast) {
      onClose()
    } else {
      setCurrentTip(currentTip + 1)
    }
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const prevTip = () => {
    if (!isFirst) {
      setCurrentTip(currentTip - 1)
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:mx-4">
        <div className="ios-modal animate-ios-slide-up sm:animate-ios-spring">
          {/* Handle (mobile only) */}
          <div className="sm:hidden ios-sheet-handle" />
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-separator">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-ios-blue/20 rounded-ios-lg flex items-center justify-center">
                <span className="text-2xl">{help.icon}</span>
              </div>
              <div>
                <h3 className="text-ios-headline font-semibold text-themed-primary">{help.title}</h3>
                <p className="text-ios-caption1 text-themed-tertiary">Подсказки по работе</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-fill-tertiary text-themed-secondary hover:text-themed-primary hover:bg-fill-secondary transition-colors ios-press"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="ios-card-grouped p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-ios-yellow/20 rounded-ios flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={18} className="text-ios-yellow" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-ios-body font-semibold text-themed-primary mb-1">{tip.title}</h4>
                  <p className="text-ios-subhead text-themed-secondary leading-relaxed">{tip.text}</p>
                </div>
              </div>
            </div>

            {/* Page Indicators */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {help.tips.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTip(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentTip 
                      ? 'w-6 bg-ios-blue' 
                      : 'w-2 bg-fill-secondary hover:bg-fill-primary'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={prevTip}
                disabled={isFirst}
                className={`
                  flex-1 h-[50px] rounded-ios-xl font-semibold text-ios-body flex items-center justify-center gap-1 transition-all ios-press
                  ${isFirst 
                    ? 'bg-fill-tertiary text-themed-quaternary cursor-not-allowed' 
                    : 'bg-fill-tertiary text-themed-primary hover:bg-fill-secondary'
                  }
                `}
              >
                <ChevronLeft size={20} />
                Назад
              </button>
              <button
                onClick={nextTip}
                className="flex-1 h-[50px] bg-ios-blue text-white rounded-ios-xl font-semibold text-ios-body flex items-center justify-center gap-1 hover:bg-ios-blue/90 transition-all ios-press"
              >
                {isLast ? 'Готово' : 'Далее'}
                {!isLast && <ChevronRight size={20} />}
              </button>
            </div>
          </div>

          {/* Counter */}
          <div className="text-center text-ios-caption1 text-themed-tertiary pb-5">
            {currentTip + 1} из {help.tips.length}
          </div>
        </div>
      </div>
    </div>
  )
}

// iOS-style Info Tip
export function InfoTip({ children, className = '' }) {
  return (
    <div className={`flex items-start gap-3 p-4 bg-ios-blue/10 border border-ios-blue/20 rounded-ios-lg ${className}`}>
      <div className="w-6 h-6 bg-ios-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
        <Info size={14} className="text-ios-blue" />
      </div>
      <span className="text-ios-subhead text-ios-blue leading-relaxed">{children}</span>
    </div>
  )
}

// iOS-style Warning Tip
export function WarningTip({ children, className = '' }) {
  return (
    <div className={`flex items-start gap-3 p-4 bg-ios-orange/10 border border-ios-orange/20 rounded-ios-lg ${className}`}>
      <div className="w-6 h-6 bg-ios-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={14} className="text-ios-orange" />
      </div>
      <span className="text-ios-subhead text-ios-orange leading-relaxed">{children}</span>
    </div>
  )
}

// Field Error
export function FieldError({ error }) {
  if (!error) return null
  return (
    <p className="text-ios-caption1 text-ios-red mt-1.5 flex items-center gap-1.5">
      <AlertTriangle size={12} />
      {error}
    </p>
  )
}

export default { HelpProvider, HelpButton, useHelp, InfoTip, WarningTip, FieldError }
