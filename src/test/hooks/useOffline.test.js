/**
 * Unit Tests for useOffline hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock navigator.onLine
let mockOnline = true

Object.defineProperty(navigator, 'onLine', {
  get: () => mockOnline,
  configurable: true
})

// Need to import after mocking
import { useOffline } from '../../hooks/useOffline'

describe('useOffline', () => {
  beforeEach(() => {
    mockOnline = true
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockOnline = true
  })

  it('should return online status', () => {
    const { result } = renderHook(() => useOffline())
    expect(result.current.isOnline).toBe(true)
  })

  it('should detect offline status', async () => {
    mockOnline = false
    
    const { result } = renderHook(() => useOffline())
    
    // Simulate offline event
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(false)
    })
  })

  it('should detect online status', async () => {
    mockOnline = false
    const { result } = renderHook(() => useOffline())
    
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    
    // Go back online
    mockOnline = true
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    
    await waitFor(() => {
      expect(result.current.isOnline).toBe(true)
    })
  })

  it('should return offline queue count', () => {
    const { result } = renderHook(() => useOffline())
    expect(typeof result.current.offlineQueueCount).toBe('number')
  })
})
