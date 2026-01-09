import { useState, useEffect, createContext, useContext } from 'react'
import { AlertTriangle, Trash2, X, Check } from 'lucide-react'

// Context для глобального доступа к диалогу
const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  
  const confirm = ({ 
    title = 'Подтверждение', 
    message, 
    confirmText = 'Да', 
    cancelText = 'Отмена',
    type = 'warning' // 'warning', 'danger', 'info'
  }) => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        confirmText,
        cancelText,
        type,
        resolve
      })
    })
  }
  
  const handleConfirm = () => {
    dialog?.resolve(true)
    setDialog(null)
  }
  
  const handleCancel = () => {
    dialog?.resolve(false)
    setDialog(null)
  }

  // Keyboard handlers
  useEffect(() => {
    if (!dialog) return
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter') {
        handleConfirm()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dialog])

  const getIcon = () => {
    switch (dialog?.type) {
      case 'danger':
        return <Trash2 size={28} className="text-ios-red" />
      case 'info':
        return <Check size={28} className="text-ios-blue" />
      default:
        return <AlertTriangle size={28} className="text-ios-orange" />
    }
  }

  const getConfirmButtonStyle = () => {
    switch (dialog?.type) {
      case 'danger':
        return 'bg-ios-red hover:bg-ios-red/90'
      case 'info':
        return 'bg-ios-blue hover:bg-ios-blue/90'
      default:
        return 'bg-ios-orange hover:bg-ios-orange/90'
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Dialog Modal */}
      {dialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="relative ios-modal w-full max-w-sm animate-ios-spring overflow-hidden">
            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              <div className={`
                w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                ${dialog.type === 'danger' ? 'bg-ios-red/15' : 
                  dialog.type === 'info' ? 'bg-ios-blue/15' : 'bg-ios-orange/15'}
              `}>
                {getIcon()}
              </div>
              
              {/* Title */}
              <h3 className="text-ios-title3 font-semibold text-themed-primary mb-2">
                {dialog.title}
              </h3>
              
              {/* Message */}
              <p className="text-ios-body text-themed-secondary">
                {dialog.message}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex border-t border-separator">
              <button
                onClick={handleCancel}
                className="flex-1 h-[50px] text-ios-body font-medium text-ios-blue hover:bg-fill-tertiary transition-colors ios-press border-r border-separator"
              >
                {dialog.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 h-[50px] text-ios-body font-semibold text-white ${getConfirmButtonStyle()} transition-colors ios-press`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

// Input Dialog Context - для диалогов с вводом текста
const InputDialogContext = createContext(null)

export function InputDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const [value, setValue] = useState('')
  
  const prompt = ({ 
    title = 'Введите значение', 
    message,
    placeholder = '',
    defaultValue = '',
    confirmText = 'OK', 
    cancelText = 'Отмена'
  }) => {
    return new Promise((resolve) => {
      setValue(defaultValue)
      setDialog({
        title,
        message,
        placeholder,
        confirmText,
        cancelText,
        resolve
      })
    })
  }
  
  const handleConfirm = () => {
    dialog?.resolve(value.trim() || null)
    setDialog(null)
    setValue('')
  }
  
  const handleCancel = () => {
    dialog?.resolve(null)
    setDialog(null)
    setValue('')
  }

  // Keyboard handlers
  useEffect(() => {
    if (!dialog) return
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'Enter' && value.trim()) {
        handleConfirm()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dialog, value])

  return (
    <InputDialogContext.Provider value={{ prompt }}>
      {children}
      
      {/* Input Dialog Modal */}
      {dialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="relative ios-modal w-full max-w-sm animate-ios-spring overflow-hidden">
            {/* Content */}
            <div className="p-5">
              {/* Title */}
              <h3 className="text-ios-title3 font-semibold text-themed-primary mb-2 text-center">
                {dialog.title}
              </h3>
              
              {/* Message */}
              {dialog.message && (
                <p className="text-ios-footnote text-themed-secondary mb-4 text-center">
                  {dialog.message}
                </p>
              )}
              
              {/* Input */}
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={dialog.placeholder}
                autoFocus
                className="w-full h-11 px-4 ios-input text-themed-primary text-center"
              />
            </div>
            
            {/* Actions */}
            <div className="flex border-t border-separator">
              <button
                onClick={handleCancel}
                className="flex-1 h-[50px] text-ios-body font-medium text-ios-blue hover:bg-fill-tertiary transition-colors ios-press border-r border-separator"
              >
                {dialog.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!value.trim()}
                className="flex-1 h-[50px] text-ios-body font-semibold text-ios-blue hover:bg-fill-tertiary transition-colors ios-press disabled:text-themed-quaternary disabled:cursor-not-allowed"
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </InputDialogContext.Provider>
  )
}

export function useInputDialog() {
  const context = useContext(InputDialogContext)
  if (!context) {
    throw new Error('useInputDialog must be used within an InputDialogProvider')
  }
  return context.prompt
}

// Toast notification component
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-ios-red'
      case 'warning':
        return 'bg-ios-orange'
      case 'info':
        return 'bg-ios-blue'
      default:
        return 'bg-ios-green'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <X size={18} />
      case 'warning':
        return <AlertTriangle size={18} />
      default:
        return <Check size={18} />
    }
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[201] animate-ios-spring">
      <div className={`${getStyle()} text-white px-5 py-3 rounded-ios-xl shadow-ios-lg flex items-center gap-3`}>
        <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
        <span className="text-ios-body font-medium">{message}</span>
      </div>
    </div>
  )
}

// Undo Toast Context - для отмены действий с обратным отсчётом
const UndoToastContext = createContext(null)

export function UndoToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const timerRef = useState({ interval: null, timeout: null })[0]
  
  const showUndoToast = ({ message, onUndo, onComplete, duration = 5 }) => {
    // Очищаем предыдущие таймеры
    if (timerRef.interval) clearInterval(timerRef.interval)
    if (timerRef.timeout) clearTimeout(timerRef.timeout)
    
    setCountdown(duration)
    setToast({ message, onUndo, onComplete })
    
    // Обратный отсчёт
    timerRef.interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    // Автоматическое выполнение
    timerRef.timeout = setTimeout(() => {
      if (onComplete) onComplete()
      setToast(null)
      setCountdown(5)
    }, duration * 1000)
  }
  
  const handleUndo = () => {
    if (timerRef.interval) clearInterval(timerRef.interval)
    if (timerRef.timeout) clearTimeout(timerRef.timeout)
    
    if (toast?.onUndo) toast.onUndo()
    setToast(null)
    setCountdown(5)
  }
  
  const handleDismiss = () => {
    if (timerRef.interval) clearInterval(timerRef.interval)
    if (timerRef.timeout) clearTimeout(timerRef.timeout)
    
    if (toast?.onComplete) toast.onComplete()
    setToast(null)
    setCountdown(5)
  }

  return (
    <UndoToastContext.Provider value={{ showUndoToast }}>
      {children}
      
      {/* Undo Toast */}
      {toast && (
        <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[201] animate-ios-slide-up">
          <div className="bg-gray-900/95 backdrop-blur-xl text-white px-4 py-3 rounded-ios-xl shadow-ios-xl flex items-center gap-4 min-w-[300px]">
            {/* Progress ring */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#FF9500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(countdown / 5) * 100.53} 100.53`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ios-orange">
                {countdown}
              </span>
            </div>
            
            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-ios-body font-medium truncate">{toast.message}</p>
              <p className="text-ios-caption1 text-gray-400">Автоудаление через {countdown} сек</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="h-9 px-4 bg-ios-blue text-white rounded-ios font-semibold text-sm hover:bg-ios-blue/90 transition-colors ios-press"
              >
                Отменить
              </button>
              <button
                onClick={handleDismiss}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </UndoToastContext.Provider>
  )
}

export function useUndoToast() {
  const context = useContext(UndoToastContext)
  if (!context) {
    throw new Error('useUndoToast must be used within an UndoToastProvider')
  }
  return context.showUndoToast
}

// Simple Status Toast - для показа статусов операций
const StatusToastContext = createContext(null)

export function StatusToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  
  const showStatus = ({ message, type = 'success', duration = 3000 }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }
  
  const success = (message) => showStatus({ message, type: 'success' })
  const error = (message) => showStatus({ message, type: 'error' })
  const info = (message) => showStatus({ message, type: 'info' })
  const warning = (message) => showStatus({ message, type: 'warning' })

  const getStyle = (type) => {
    switch (type) {
      case 'error': return 'bg-ios-red'
      case 'warning': return 'bg-ios-orange'
      case 'info': return 'bg-ios-blue'
      default: return 'bg-ios-green'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'error': return <X size={16} />
      case 'warning': return <AlertTriangle size={16} />
      default: return <Check size={16} />
    }
  }

  return (
    <StatusToastContext.Provider value={{ showStatus, success, error, info, warning }}>
      {children}
      
      {/* Status Toasts Stack */}
      <div className="fixed top-4 right-4 z-[202] flex flex-col gap-2">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id}
            className={`${getStyle(toast.type)} text-white px-4 py-2.5 rounded-ios-lg shadow-ios-lg flex items-center gap-2.5 animate-ios-slide-up min-w-[200px]`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {getIcon(toast.type)}
            </div>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </StatusToastContext.Provider>
  )
}

export function useStatusToast() {
  const context = useContext(StatusToastContext)
  if (!context) {
    throw new Error('useStatusToast must be used within a StatusToastProvider')
  }
  return context
}
