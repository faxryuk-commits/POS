/**
 * SwipeToDelete Component
 * iOS-style swipe gesture to reveal delete action
 */

import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'

export default function SwipeToDelete({ 
  children, 
  onDelete, 
  threshold = 80,
  disabled = false 
}) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const containerRef = useRef(null)

  const handleTouchStart = (e) => {
    if (disabled) return
    startX.current = e.touches[0].clientX
    currentX.current = startX.current
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || disabled) return
    currentX.current = e.touches[0].clientX
    const diff = startX.current - currentX.current
    
    // Only allow swipe left (positive diff)
    if (diff > 0) {
      // Add resistance after threshold
      const newTranslate = diff > threshold 
        ? threshold + (diff - threshold) * 0.3 
        : diff
      setTranslateX(Math.min(newTranslate, threshold * 1.5))
    } else {
      setTranslateX(Math.max(diff * 0.3, -20))
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const diff = startX.current - currentX.current
    
    if (diff > threshold) {
      // Show delete button
      setTranslateX(threshold)
      setShowDelete(true)
    } else {
      // Snap back
      setTranslateX(0)
      setShowDelete(false)
    }
  }

  const handleMouseDown = (e) => {
    if (disabled) return
    startX.current = e.clientX
    currentX.current = startX.current
    setIsDragging(true)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return
    currentX.current = e.clientX
    const diff = startX.current - currentX.current
    
    if (diff > 0) {
      const newTranslate = diff > threshold 
        ? threshold + (diff - threshold) * 0.3 
        : diff
      setTranslateX(Math.min(newTranslate, threshold * 1.5))
    } else {
      setTranslateX(Math.max(diff * 0.3, -20))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    
    const diff = startX.current - currentX.current
    
    if (diff > threshold) {
      setTranslateX(threshold)
      setShowDelete(true)
    } else {
      setTranslateX(0)
      setShowDelete(false)
    }
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const handleDelete = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    onDelete?.()
    setTranslateX(0)
    setShowDelete(false)
  }

  const handleReset = () => {
    setTranslateX(0)
    setShowDelete(false)
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Delete button background */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-ios-red"
        style={{ width: `${threshold + 20}px` }}
      >
        <button
          onClick={handleDelete}
          className="w-full h-full flex items-center justify-center gap-2 text-white font-semibold"
        >
          <Trash2 size={20} />
          {showDelete && <span className="text-sm">Удалить</span>}
        </button>
      </div>

      {/* Main content */}
      <div
        className={`
          relative bg-white dark:bg-gray-800 
          ${isDragging ? '' : 'transition-transform duration-200 ease-out'}
        `}
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={showDelete ? handleReset : undefined}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * SwipeActions Component
 * More flexible swipe with left and right actions
 */
export function SwipeActions({
  children,
  leftAction,
  rightAction,
  leftThreshold = 80,
  rightThreshold = 80,
  disabled = false,
}) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e) => {
    if (disabled) return
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || disabled) return
    const diff = e.touches[0].clientX - startX.current
    
    // Apply resistance at edges
    let newTranslate = diff
    if (diff > 0 && leftAction) {
      newTranslate = diff > leftThreshold 
        ? leftThreshold + (diff - leftThreshold) * 0.3 
        : diff
    } else if (diff < 0 && rightAction) {
      newTranslate = diff < -rightThreshold 
        ? -rightThreshold + (diff + rightThreshold) * 0.3 
        : diff
    } else {
      newTranslate = diff * 0.3
    }
    
    setTranslateX(newTranslate)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    if (translateX > leftThreshold && leftAction) {
      leftAction.onAction?.()
    } else if (translateX < -rightThreshold && rightAction) {
      rightAction.onAction?.()
    }
    
    setTranslateX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left action background */}
      {leftAction && (
        <div 
          className={`absolute inset-y-0 left-0 flex items-center justify-start px-4 ${leftAction.bgColor || 'bg-ios-green'}`}
          style={{ width: `${leftThreshold + 20}px` }}
        >
          {leftAction.icon}
        </div>
      )}

      {/* Right action background */}
      {rightAction && (
        <div 
          className={`absolute inset-y-0 right-0 flex items-center justify-end px-4 ${rightAction.bgColor || 'bg-ios-red'}`}
          style={{ width: `${rightThreshold + 20}px` }}
        >
          {rightAction.icon}
        </div>
      )}

      {/* Main content */}
      <div
        className={`
          relative bg-white dark:bg-gray-800 
          ${isDragging ? '' : 'transition-transform duration-200 ease-out'}
        `}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
