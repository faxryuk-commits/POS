import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react'
import { logError, getErrorLogs, clearErrorLogs } from '../services/errorService'

/**
 * Error Boundary компонент для перехвата ошибок React
 * Улучшенная версия с детальным логированием и красивым UI
 * @extends Component
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      copied: false,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    
    // Логирование через errorService
    logError(error, {
      componentStack: errorInfo.componentStack,
      boundary: this.props.name || 'root'
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  handleCopyError = () => {
    const errorText = `
Error: ${this.state.error?.toString()}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Time: ${new Date().toISOString()}
    `.trim()

    navigator.clipboard.writeText(errorText).then(() => {
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-themed-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-themed-secondary rounded-2xl border border-themed shadow-xl p-8 text-center">
            {/* Анимированная иконка ошибки */}
            <div className="w-20 h-20 bg-ios-red/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertTriangle size={40} className="text-ios-red" />
            </div>
            
            {/* Заголовок */}
            <h1 className="text-2xl font-bold text-themed-primary mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-themed-secondary mb-6">
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу или вернуться на главную.
            </p>
            
            {/* Детали ошибки (свёрнуты) */}
            {this.state.error && (
              <div className="mb-6 text-left">
                <button 
                  onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                  className="flex items-center gap-2 text-sm text-themed-tertiary hover:text-themed-primary transition-colors w-full"
                >
                  <Bug size={16} />
                  {this.state.showDetails ? 'Скрыть детали' : 'Техническая информация'}
                </button>
                
                {this.state.showDetails && (
                  <div className="mt-3 relative">
                    <pre className="p-3 bg-themed-tertiary rounded-xl text-xs text-ios-red overflow-x-auto max-h-40">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack && (
                        <span className="text-themed-tertiary block mt-2">
                          {this.state.errorInfo.componentStack.slice(0, 500)}...
                        </span>
                      )}
                    </pre>
                    <button
                      onClick={this.handleCopyError}
                      className="absolute top-2 right-2 p-1.5 bg-themed-secondary rounded-lg text-themed-secondary hover:text-themed-primary transition-colors"
                      title="Скопировать ошибку"
                    >
                      {this.state.copied ? <Check size={14} className="text-ios-green" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Кнопки действий */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 h-12 bg-themed-tertiary hover:bg-fill-secondary text-themed-primary rounded-ios-lg font-medium flex items-center justify-center gap-2 transition-colors ios-press"
              >
                <Home size={20} />
                На главную
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 h-12 bg-ios-blue hover:bg-ios-blue/90 text-white rounded-ios-lg font-medium flex items-center justify-center gap-2 transition-colors ios-press"
              >
                <RefreshCw size={20} />
                Перезагрузить
              </button>
            </div>

            {/* Версия приложения */}
            <p className="mt-6 text-xs text-themed-quaternary">
              POS System v1.0.0 • {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC для оборачивания компонентов в ErrorBoundary
 * @param {Component} WrappedComponent - Компонент для оборачивания
 * @param {string} fallbackMessage - Сообщение при ошибке
 */
export function withErrorBoundary(WrappedComponent, fallbackMessage) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary
