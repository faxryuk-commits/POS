/**
 * Компонентные тесты
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import OfflineIndicator from '../components/OfflineIndicator'

// Компонент, который выбрасывает ошибку
function ProblematicComponent() {
  throw new Error('Test error')
}

// Обычный компонент
function GoodComponent() {
  return <div>Working fine</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Подавляем console.error для тестов
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('должен рендерить children когда нет ошибок', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Working fine')).toBeInTheDocument()
  })

  it('должен показывать fallback UI при ошибке', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    expect(screen.getByText('Перезагрузить')).toBeInTheDocument()
    expect(screen.getByText('На главную')).toBeInTheDocument()
  })

  it('должен показывать техническую информацию', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    )
    
    const details = screen.getByText('Техническая информация')
    expect(details).toBeInTheDocument()
  })
})

describe('OfflineIndicator', () => {
  it('должен не показываться когда онлайн', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    })
    
    const { container } = render(<OfflineIndicator />)
    
    // Компонент не должен рендерить ничего когда онлайн и баннер скрыт
    expect(container.firstChild).toBeNull()
  })
})
