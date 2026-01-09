/**
 * Сервис для централизованного логирования и обработки ошибок
 * 
 * Возможности:
 * - Локальное логирование в localStorage
 * - Подготовка к отправке на сервер (Sentry/LogRocket)
 * - Категоризация ошибок
 * - Ограничение размера логов
 */

const ERROR_LOG_KEY = 'pos-error-log'
const MAX_ERRORS = 50

/**
 * Типы ошибок
 */
export const ErrorTypes = {
  RENDER: 'render',
  NETWORK: 'network',
  VALIDATION: 'validation',
  STORE: 'store',
  AUTH: 'auth',
  PAYMENT: 'payment',
  UNKNOWN: 'unknown'
}

/**
 * Уровни серьезности
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Создать объект ошибки для логирования
 */
function createErrorEntry(error, context = {}) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    timestamp: new Date().toISOString(),
    message: error?.message || error?.toString() || 'Unknown error',
    stack: error?.stack || null,
    type: context.type || ErrorTypes.UNKNOWN,
    severity: context.severity || ErrorSeverity.MEDIUM,
    component: context.component || null,
    componentStack: context.componentStack || null,
    boundary: context.boundary || null,
    url: typeof window !== 'undefined' ? window.location.href : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    extra: context.extra || {}
  }
}

/**
 * Получить логи ошибок из localStorage
 */
export function getErrorLogs() {
  try {
    const logs = localStorage.getItem(ERROR_LOG_KEY)
    return logs ? JSON.parse(logs) : []
  } catch (e) {
    console.error('Failed to get error logs:', e)
    return []
  }
}

/**
 * Сохранить ошибку в лог
 */
export function logError(error, context = {}) {
  try {
    const entry = createErrorEntry(error, context)
    const logs = getErrorLogs()
    
    // Добавляем новую ошибку в начало
    logs.unshift(entry)
    
    // Ограничиваем размер логов
    if (logs.length > MAX_ERRORS) {
      logs.splice(MAX_ERRORS)
    }
    
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs))
    
    // Логируем в консоль в development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Error Logged')
      console.error('Message:', entry.message)
      console.log('Type:', entry.type)
      console.log('Severity:', entry.severity)
      if (entry.stack) console.log('Stack:', entry.stack)
      if (entry.componentStack) console.log('Component Stack:', entry.componentStack)
      console.groupEnd()
    }
    
    // Здесь можно добавить отправку в Sentry/LogRocket
    // sendToRemoteLogger(entry)
    
    return entry
  } catch (e) {
    console.error('Failed to log error:', e)
    return null
  }
}

/**
 * Очистить логи ошибок
 */
export function clearErrorLogs() {
  try {
    localStorage.removeItem(ERROR_LOG_KEY)
    return true
  } catch (e) {
    console.error('Failed to clear error logs:', e)
    return false
  }
}

/**
 * Получить статистику ошибок
 */
export function getErrorStats() {
  const logs = getErrorLogs()
  
  const byType = {}
  const bySeverity = {}
  const last24h = []
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000
  
  logs.forEach(log => {
    // По типу
    byType[log.type] = (byType[log.type] || 0) + 1
    
    // По серьезности
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1
    
    // За последние 24 часа
    if (new Date(log.timestamp).getTime() > dayAgo) {
      last24h.push(log)
    }
  })
  
  return {
    total: logs.length,
    byType,
    bySeverity,
    last24h: last24h.length,
    critical: bySeverity[ErrorSeverity.CRITICAL] || 0
  }
}

/**
 * Создать обработчик ошибок для async функций
 */
export function createErrorHandler(context = {}) {
  return (error) => {
    logError(error, context)
    throw error // Пробрасываем ошибку дальше
  }
}

/**
 * Обернуть async функцию в обработчик ошибок
 */
export function withErrorHandling(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, context)
      throw error
    }
  }
}

/**
 * Логировать предупреждение (не ошибка)
 */
export function logWarning(message, context = {}) {
  logError(new Error(message), {
    ...context,
    severity: ErrorSeverity.LOW,
    type: context.type || 'warning'
  })
}

/**
 * Логировать ошибку сети
 */
export function logNetworkError(error, url, context = {}) {
  logError(error, {
    ...context,
    type: ErrorTypes.NETWORK,
    extra: {
      ...context.extra,
      url,
      status: error?.response?.status
    }
  })
}

/**
 * Логировать ошибку валидации
 */
export function logValidationError(field, message, context = {}) {
  logError(new Error(`Validation: ${field} - ${message}`), {
    ...context,
    type: ErrorTypes.VALIDATION,
    severity: ErrorSeverity.LOW,
    extra: {
      ...context.extra,
      field,
      validationMessage: message
    }
  })
}

/**
 * Логировать критическую ошибку
 */
export function logCriticalError(error, context = {}) {
  logError(error, {
    ...context,
    severity: ErrorSeverity.CRITICAL
  })
}

// Глобальный обработчик необработанных ошибок
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      type: ErrorTypes.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason || new Error('Unhandled Promise Rejection'), {
      type: ErrorTypes.UNKNOWN,
      severity: ErrorSeverity.HIGH,
      extra: {
        promise: true
      }
    })
  })
}

export default {
  logError,
  logWarning,
  logNetworkError,
  logValidationError,
  logCriticalError,
  getErrorLogs,
  clearErrorLogs,
  getErrorStats,
  createErrorHandler,
  withErrorHandling,
  ErrorTypes,
  ErrorSeverity
}
