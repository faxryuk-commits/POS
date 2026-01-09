import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Delete, LogIn, AlertCircle } from 'lucide-react'
import { ThemeProvider } from './ThemeProvider'

export default function PinLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  
  const { login, cashiers, settings, getCurrency } = useStore()
  const currency = getCurrency()

  const handleDigit = useCallback((digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      if (newPin.length === 4) {
        setTimeout(() => attemptLogin(newPin), 200)
      }
    }
  }, [pin])

  const handleDelete = useCallback(() => {
    setPin(pin.slice(0, -1))
    setError('')
    if (navigator.vibrate) navigator.vibrate(10)
  }, [pin])

  const attemptLogin = (pinCode) => {
    const result = login(pinCode)
    if (!result.success) {
      setError('Неверный PIN-код')
      setShake(true)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
      setTimeout(() => {
        setShake(false)
        setPin('')
      }, 500)
    } else {
      if (navigator.vibrate) navigator.vibrate([30, 30, 30])
    }
  }

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key)
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete()
      } else if (e.key === 'Enter' && pin.length === 4) {
        attemptLogin(pin)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDigit, handleDelete, pin])

  return (
    <ThemeProvider>
      <div 
        className="fixed inset-0 bg-themed-primary flex flex-col items-center overflow-y-auto safe-area-top safe-area-bottom"
        role="main"
        aria-label="Экран авторизации"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-ios-blue/5 via-transparent to-ios-purple/5 pointer-events-none" />
      
        <div className="relative w-full max-w-[320px] flex flex-col items-center py-6 px-4 min-h-full justify-center">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8 flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-ios-blue to-ios-purple rounded-[24px] sm:rounded-[28px] flex items-center justify-center mx-auto mb-4 shadow-ios-xl">
              <span className="text-3xl sm:text-4xl font-bold text-white">{currency.symbol}</span>
            </div>
            <h1 className="text-xl sm:text-ios-title1 font-bold text-themed-primary mb-1">POS System</h1>
            <p className="text-sm sm:text-ios-subhead text-themed-secondary">{settings?.storeName || 'Добро пожаловать'}</p>
          </div>

          {/* PIN indicator */}
          <div 
            className={`mb-5 sm:mb-6 flex-shrink-0 ${shake ? 'animate-ios-shake' : ''}`}
            role="status"
            aria-live="polite"
            aria-label={`Введено ${pin.length} из 4 цифр`}
          >
            <p className="text-center text-xs sm:text-ios-footnote text-themed-secondary mb-3">Введите PIN-код</p>
            <div className="flex justify-center gap-4 sm:gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={`
                    w-3 h-3 sm:w-[14px] sm:h-[14px] rounded-full transition-all duration-200
                    ${pin.length > i
                      ? 'bg-ios-blue scale-125 shadow-[0_0_12px_rgba(0,122,255,0.5)]'
                      : 'bg-fill-secondary'
                    }
                  `}
                />
              ))}
            </div>
            
            {error && (
              <div 
                className="flex items-center justify-center gap-2 text-ios-red text-xs sm:text-ios-footnote mt-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle size={14} aria-hidden="true" />
                {error}
              </div>
            )}
          </div>

          {/* iOS-style Keypad */}
          <div 
            className="grid grid-cols-3 gap-3 sm:gap-4 flex-shrink-0"
            role="group"
            aria-label="Клавиатура для ввода PIN-кода"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit.toString())}
                aria-label={`Цифра ${digit}`}
                className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] bg-fill-themed rounded-full text-[28px] sm:text-[32px] font-light text-themed-primary hover:opacity-80 active:opacity-60 active:scale-95 transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
              >
                {digit}
              </button>
            ))}
            
            {/* Delete */}
            <button
              onClick={handleDelete}
              aria-label="Удалить последнюю цифру"
              className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] flex items-center justify-center text-ios-blue hover:text-ios-blue/70 active:scale-95 transition-all duration-100 focus:outline-none"
            >
              <Delete size={26} aria-hidden="true" />
            </button>
            
            {/* Zero */}
            <button
              onClick={() => handleDigit('0')}
              aria-label="Цифра 0"
              className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] bg-fill-themed rounded-full text-[28px] sm:text-[32px] font-light text-themed-primary hover:opacity-80 active:opacity-60 active:scale-95 transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
            >
              0
            </button>
            
            {/* Enter */}
            <button
              onClick={() => pin.length === 4 && attemptLogin(pin)}
              disabled={pin.length !== 4}
              aria-label="Войти"
              aria-disabled={pin.length !== 4}
              className={`
                w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] rounded-full flex items-center justify-center transition-all duration-100 focus:outline-none active:scale-95
                ${pin.length === 4
                  ? 'bg-ios-blue text-white hover:bg-ios-blue/90 shadow-[0_0_20px_rgba(0,122,255,0.4)]'
                  : 'text-themed-quaternary'
                }
              `}
            >
              <LogIn size={24} aria-hidden="true" />
            </button>
          </div>

          {/* Demo Cashiers */}
          <div className="mt-6 sm:mt-8 text-center flex-shrink-0">
            <p className="text-xs sm:text-ios-caption1 text-themed-tertiary mb-2 sm:mb-3">Демо PIN-коды</p>
            <div className="flex flex-wrap justify-center gap-2">
              {cashiers.map((cashier) => (
                <button
                  key={cashier.id}
                  onClick={() => {
                    setPin(cashier.pin)
                    setTimeout(() => attemptLogin(cashier.pin), 200)
                  }}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-fill-themed rounded-ios-full text-[11px] sm:text-ios-caption2 text-themed-secondary hover:text-themed-primary transition-all ios-press"
                >
                  {cashier.name}: <span className="font-mono">{cashier.pin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 text-center flex-shrink-0 pb-2">
            <p className="text-[10px] sm:text-ios-caption2 text-themed-tertiary">
              {new Date().getFullYear()} • POS System
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
