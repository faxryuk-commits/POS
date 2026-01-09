/**
 * Virtualized Product Grid
 * Uses react-window for efficient rendering of large product lists
 */

import { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import { ProductCardSkeleton } from './Skeleton'

// Иконки категорий
const categoryIcons = {
  'Все': '🏪',
  'Напитки': '🥤',
  'Сладости': '🍫',
  'Хлеб': '🍞',
  'Молочные': '🥛',
  'Фрукты': '🍎',
  'Снеки': '🍿',
  'Табак': '🚬',
  'Алкоголь': '🍺',
}

// Memoized Product Card
const ProductCard = memo(function ProductCard({ 
  product, 
  cartQuantity, 
  isAvailable, 
  availabilityInfo, 
  onAdd, 
  formatPrice,
  style 
}) {
  if (!product) return <div style={style} />

  return (
    <div style={style} className="p-1.5">
      <button
        onClick={() => product.stock > 0 && isAvailable && onAdd(product)}
        disabled={product.stock <= 0 || !isAvailable}
        className={`
          w-full h-full relative p-3 rounded-ios-xl ios-press overflow-visible
          ${product.stock <= 0 || !isAvailable
            ? 'bg-themed-tertiary opacity-50 cursor-not-allowed'
            : 'ios-card-interactive'
          }
        `}
      >
        {/* Cart Badge */}
        {cartQuantity > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-ios-blue rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-ios z-10">
            {cartQuantity}
          </div>
        )}
        
        {/* Low Stock Warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-ios-orange/20 rounded-md text-[10px] text-ios-orange font-semibold">
            {product.stock} шт
          </div>
        )}

        {/* Not Available */}
        {!isAvailable && availabilityInfo && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-ios-red/20 rounded-md text-[10px] text-ios-red font-semibold">
            {availabilityInfo.time}
          </div>
        )}
        
        {/* Product Icon */}
        <div className="text-3xl mb-2 h-10 flex items-center justify-center">
          {categoryIcons[product.category] || '📦'}
        </div>
        
        {/* Product Name */}
        <div className="text-ios-caption1 text-themed-primary truncate mb-1 font-medium">
          {product.name}
        </div>
        
        {/* Price */}
        <div className="text-ios-subhead font-bold text-ios-blue">
          {formatPrice(product.price)}
        </div>
      </button>
    </div>
  )
})

// Cell renderer for the grid
const Cell = memo(function Cell({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}) {
  const { 
    products, 
    columnCount, 
    cart, 
    isProductAvailable, 
    getProductAvailabilityInfo,
    onAdd,
    formatPrice,
    isLoading
  } = data

  const index = rowIndex * columnCount + columnIndex
  const product = products[index]

  if (isLoading) {
    return (
      <div style={style} className="p-1.5">
        <ProductCardSkeleton />
      </div>
    )
  }

  if (!product) {
    return <div style={style} />
  }

  const cartItem = cart.find(item => item.id === product.id)
  const cartQuantity = cartItem?.quantity || 0
  const available = isProductAvailable(product.id)
  const availabilityInfo = getProductAvailabilityInfo(product.id)

  return (
    <ProductCard
      product={product}
      cartQuantity={cartQuantity}
      isAvailable={available}
      availabilityInfo={availabilityInfo}
      onAdd={onAdd}
      formatPrice={formatPrice}
      style={style}
    />
  )
})

/**
 * Virtualized Product Grid Component
 */
export default function VirtualizedProductGrid({
  products,
  cart,
  isProductAvailable,
  getProductAvailabilityInfo,
  onAddToCart,
  formatPrice,
  isLoading = false,
  minColumnWidth = 140,
  rowHeight = 140,
}) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Calculate dimensions
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Calculate column count based on container width
  const columnCount = useMemo(() => {
    if (dimensions.width === 0) return 3
    return Math.max(2, Math.floor(dimensions.width / minColumnWidth))
  }, [dimensions.width, minColumnWidth])

  // Calculate row count
  const rowCount = useMemo(() => {
    return Math.ceil(products.length / columnCount)
  }, [products.length, columnCount])

  // Column width
  const columnWidth = useMemo(() => {
    if (dimensions.width === 0) return minColumnWidth
    return dimensions.width / columnCount
  }, [dimensions.width, columnCount, minColumnWidth])

  // Data for cells
  const itemData = useMemo(() => ({
    products,
    columnCount,
    cart,
    isProductAvailable,
    getProductAvailabilityInfo,
    onAdd: onAddToCart,
    formatPrice,
    isLoading,
  }), [products, columnCount, cart, isProductAvailable, getProductAvailabilityInfo, onAddToCart, formatPrice, isLoading])

  // Handle add with haptic
  const handleAdd = useCallback((product) => {
    onAddToCart(product)
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [onAddToCart])

  // Updated item data with haptic handler
  const itemDataWithHaptic = useMemo(() => ({
    ...itemData,
    onAdd: handleAdd,
  }), [itemData, handleAdd])

  // Show skeleton grid while loading or measuring
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={dimensions.height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={dimensions.width}
        itemData={itemDataWithHaptic}
        overscanRowCount={2}
        className="scrollbar-hide"
      >
        {Cell}
      </Grid>
    </div>
  )
}

/**
 * Auto-sizing wrapper for virtualized grid
 */
export function AutoSizeProductGrid(props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <VirtualizedProductGrid {...props} />
    </div>
  )
}
