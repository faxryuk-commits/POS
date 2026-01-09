/**
 * iOS-style Skeleton Loading Components
 * Animated placeholders for loading states
 */

// Base skeleton with shimmer animation
export function Skeleton({ className = '', variant = 'rect' }) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]'
  
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  }

  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={{ animation: 'shimmer 1.5s infinite' }}
    />
  )
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      {/* Icon placeholder */}
      <div className="flex justify-center mb-2">
        <Skeleton variant="circle" className="w-10 h-10" />
      </div>
      {/* Name placeholder */}
      <Skeleton variant="text" className="w-3/4 mx-auto mb-2" />
      {/* Price placeholder */}
      <Skeleton variant="text" className="w-1/2 mx-auto h-5" />
    </div>
  )
}

// Product row skeleton (for table view)
export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
      <Skeleton variant="circle" className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/4 h-3" />
      </div>
      <Skeleton variant="text" className="w-16" />
      <Skeleton variant="text" className="w-12" />
      <div className="flex gap-2">
        <Skeleton variant="circle" className="w-8 h-8" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
    </div>
  )
}

// Cart item skeleton
export function CartItemSkeleton() {
  return (
    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-2/3" />
          <Skeleton variant="text" className="w-1/3 h-3" />
        </div>
        <Skeleton variant="text" className="w-16 h-5" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="rect" className="w-24 h-9 rounded-lg" />
        <Skeleton variant="circle" className="w-9 h-9 ml-auto" />
      </div>
    </div>
  )
}

// Receipt history item skeleton
export function ReceiptSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="w-24" />
          <Skeleton variant="rect" className="w-16 h-5 rounded-full" />
        </div>
        <Skeleton variant="text" className="w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-28 h-3" />
        <Skeleton variant="text" className="w-16 h-3" />
      </div>
      <Skeleton variant="text" className="w-3/4 h-3 mt-2" />
    </div>
  )
}

// Category button skeleton
export function CategorySkeleton() {
  return (
    <Skeleton variant="rect" className="w-24 h-10 rounded-full flex-shrink-0" />
  )
}

// Combo/Recommendation card skeleton
export function ComboCardSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0 min-w-[180px]">
      <Skeleton variant="circle" className="w-8 h-8" />
      <div className="flex-1 space-y-1">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="text" className="w-16 h-3" />
      </div>
      <Skeleton variant="circle" className="w-6 h-6" />
    </div>
  )
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <Skeleton variant="text" className="w-8 h-8 mb-2" />
      <Skeleton variant="text" className="w-16 h-3" />
    </div>
  )
}

// Full page loading skeleton
export function PageLoadingSkeleton({ type = 'products' }) {
  if (type === 'products') {
    return (
      <div className="p-4 space-y-4">
        {/* Search bar */}
        <Skeleton variant="rect" className="w-full h-11 rounded-xl" />
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        
        {/* Table */}
        <div className="space-y-0">
          {[...Array(6)].map((_, i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'pos') {
    return (
      <div className="flex h-full">
        {/* Products panel */}
        <div className="flex-1 p-4 space-y-4">
          <Skeleton variant="rect" className="w-full h-11 rounded-xl" />
          <div className="flex gap-2 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Cart panel */}
        <div className="hidden md:block w-80 p-4 border-l border-gray-200 dark:border-gray-700 space-y-3">
          <Skeleton variant="text" className="w-24 h-6" />
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
          <Skeleton variant="rect" className="w-full h-12 rounded-xl mt-4" />
        </div>
      </div>
    )
  }

  return null
}

// Add shimmer keyframe to global styles
export const shimmerKeyframe = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`
