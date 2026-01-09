/**
 * Unit Tests for PinLogin Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PinLogin from '../../components/PinLogin'
import { useStore } from '../../store/useStore'

// Mock the store
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn()
}))

describe('PinLogin', () => {
  const mockLogin = vi.fn()
  const mockCashiers = [
    { id: 1, name: 'Администратор', pin: '0000', role: 'admin' },
    { id: 2, name: 'Кассир 1', pin: '1234', role: 'cashier' }
  ]
  const mockSettings = { storeName: 'Test Store' }
  const mockCurrency = { symbol: '₽', name: 'Рубль' }

  beforeEach(() => {
    vi.clearAllMocks()
    useStore.mockReturnValue({
      login: mockLogin,
      cashiers: mockCashiers,
      settings: mockSettings,
      getCurrency: () => mockCurrency
    })
  })

  it('should render PIN login screen', () => {
    render(<PinLogin />)
    
    expect(screen.getByRole('heading', { name: /POS System/i })).toBeInTheDocument()
    expect(screen.getByText('Введите PIN-код')).toBeInTheDocument()
  })

  it('should render numeric keypad', () => {
    render(<PinLogin />)
    
    // Check all digits 0-9
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: `Цифра ${i}` })).toBeInTheDocument()
    }
  })

  it('should render demo cashier buttons', () => {
    render(<PinLogin />)
    
    expect(screen.getByText(/Администратор.*0000/)).toBeInTheDocument()
    expect(screen.getByText(/Кассир 1.*1234/)).toBeInTheDocument()
  })

  it('should call login when demo button is clicked', async () => {
    mockLogin.mockReturnValue({ success: true, cashier: mockCashiers[0] })
    render(<PinLogin />)
    
    const adminButton = screen.getByText(/Администратор.*0000/)
    await userEvent.click(adminButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('0000')
    })
  })

  it('should show error for invalid PIN', async () => {
    mockLogin.mockReturnValue({ success: false })
    render(<PinLogin />)
    
    // Enter invalid PIN
    await userEvent.click(screen.getByRole('button', { name: 'Цифра 9' }))
    await userEvent.click(screen.getByRole('button', { name: 'Цифра 9' }))
    await userEvent.click(screen.getByRole('button', { name: 'Цифра 9' }))
    await userEvent.click(screen.getByRole('button', { name: 'Цифра 9' }))
    
    await waitFor(() => {
      expect(screen.getByText('Неверный PIN-код')).toBeInTheDocument()
    })
  })

  it('should delete digit when delete button is clicked', async () => {
    render(<PinLogin />)
    
    // Enter some digits
    await userEvent.click(screen.getByRole('button', { name: 'Цифра 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Цифра 2' }))
    
    // Delete one
    await userEvent.click(screen.getByRole('button', { name: /Удалить/i }))
    
    // Should still be on login screen
    expect(screen.getByText('Введите PIN-код')).toBeInTheDocument()
  })

  it('should display store name', () => {
    render(<PinLogin />)
    expect(screen.getByText('Test Store')).toBeInTheDocument()
  })
})
