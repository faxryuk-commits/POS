/**
 * Unit Tests for Navigation Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '../../components/Navigation'
import { useStore } from '../../store/useStore'

// Mock the store
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn()
}))

describe('Navigation', () => {
  const mockSetActivePage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useStore.mockReturnValue({
      activePage: 'pos',
      setActivePage: mockSetActivePage,
      getCartCount: () => 0,
      currentCashier: { role: 'admin' }
    })
  })

  it('should render navigation tabs', () => {
    render(<Navigation />)
    
    expect(screen.getByRole('tab', { name: /Касса/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Товары/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Каталог/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Отчёты/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Ещё/i })).toBeInTheDocument()
  })

  it('should show active tab as selected', () => {
    render(<Navigation />)
    
    const kassaTab = screen.getByRole('tab', { name: /Касса/i })
    expect(kassaTab).toHaveAttribute('aria-selected', 'true')
  })

  it('should call setActivePage when tab is clicked', async () => {
    render(<Navigation />)
    
    const productsTab = screen.getByRole('tab', { name: /Товары/i })
    await userEvent.click(productsTab)
    
    expect(mockSetActivePage).toHaveBeenCalledWith('products')
  })

  it('should show cart count badge when cart has items', () => {
    useStore.mockReturnValue({
      activePage: 'pos',
      setActivePage: mockSetActivePage,
      getCartCount: () => 5,
      currentCashier: { role: 'admin' }
    })
    
    render(<Navigation />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should not show cart badge when cart is empty', () => {
    useStore.mockReturnValue({
      activePage: 'pos',
      setActivePage: mockSetActivePage,
      getCartCount: () => 0,
      currentCashier: { role: 'admin' }
    })
    
    render(<Navigation />)
    
    // The badge should not exist
    const badges = screen.queryAllByText(/^\d+$/)
    expect(badges.length).toBe(0)
  })
})
