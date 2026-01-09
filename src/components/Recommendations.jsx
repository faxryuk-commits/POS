import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { useDiscountStore } from '../store/discountStore'
import { 
  Sparkles, TrendingUp, Package, Plus, Gift, 
  X, Zap, Star, ShoppingBag, Utensils, Percent, Check,
  ChevronDown, ChevronUp
} from 'lucide-react'

// Иконки категорий
const categoryIcons = {
  'Напитки': '🥤',
  'Сладости': '🍫',
  'Хлеб': '🍞',
  'Молочные': '🥛',
  'Фрукты': '🍎',
  'Снеки': '🍿',
  'Табак': '🚬',
  'Алкоголь': '🍺',
}

/**
 * iOS-style Recommendations Component - Shelf Layout
 * Показывает рекомендации в виде "полок" для быстрого доступа
 */
export default function Recommendations({ compact = false }) {
  const [expandedShelf, setExpandedShelf] = useState(null)
  const [dismissedCombos, setDismissedCombos] = useState(new Set())
  const [addedAccessories, setAddedAccessories] = useState(new Set())
  
  const { 
    cart, 
    getRecommendations, 
    getAvailableCombos, 
    getSmartRecommendations,
    getRecommendedAccessories,
    addToCart,
    addComboToCart,
    addAccessoryToCart,
    getCurrencySymbol,
    getCartTotal
  } = useStore()

  const { getTotalDiscount } = useDiscountStore()
  
  const currencySymbol = getCurrencySymbol()
  const formatPrice = (price) => `${(price || 0).toLocaleString()} ${currencySymbol}`
  
  const recommendations = getRecommendations()
  const combos = getAvailableCombos().filter(c => !dismissedCombos.has(c.id))
  const smartRecs = getSmartRecommendations()
  const accessories = getRecommendedAccessories()
  
  const cartTotal = getCartTotal()
  const discountInfo = getTotalDiscount(cart, cartTotal)
  
  const showPopular = cart.length === 0
  const totalRecs = recommendations.length + combos.length + smartRecs.length + accessories.length
  
  if (totalRecs === 0 && !showPopular && discountInfo.total === 0) return null

  const handleAddToCart = (product) => {
    addToCart(product)
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const handleAddCombo = (comboId) => {
    const result = addComboToCart(comboId, true)
    if (result) {
      setDismissedCombos(prev => new Set([...prev, comboId]))
      if (navigator.vibrate) navigator.vibrate([30, 20, 30])
    }
  }

  const handleAddAccessory = (accessoryId) => {
    addAccessoryToCart(accessoryId)
    setAddedAccessories(prev => new Set([...prev, accessoryId]))
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const dismissCombo = (comboId) => {
    setDismissedCombos(prev => new Set([...prev, comboId]))
  }

  // Shelves configuration
  const shelves = useMemo(() => {
    const result = []
    
    if (combos.length > 0) {
      result.push({
        id: 'combos',
        icon: Gift,
        label: '🎁 Комбо-наборы',
        color: 'ios-orange',
        items: combos,
        type: 'combo'
      })
    }
    
    if (accessories.length > 0) {
      result.push({
        id: 'accessories',
        icon: Utensils,
        label: '🍴 Дополнения',
        color: 'ios-teal',
        items: accessories,
        type: 'accessory'
      })
    }
    
    if (recommendations.length > 0) {
      result.push({
        id: 'pairs',
        icon: Package,
        label: '📦 К вашему заказу',
        color: 'ios-blue',
        items: recommendations,
        type: 'product'
      })
    }
    
    if (smartRecs.length > 0 || showPopular) {
      result.push({
        id: 'popular',
        icon: TrendingUp,
        label: '🔥 Популярное',
        color: 'ios-purple',
        items: smartRecs,
        type: 'product'
      })
    }
    
    return result
  }, [combos, accessories, recommendations, smartRecs, showPopular])

  // Compact mode - single row with quick access buttons
  if (compact) {
    const hasContent = combos.length > 0 || accessories.length > 0 || recommendations.length > 0
    if (!hasContent) return null

    return (
      <div className="bg-gradient-to-t from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-850 border-t border-gray-200 dark:border-gray-700">
        {/* Quick Access Shelf */}
        <div className="px-3 py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-ios-orange/15 rounded-lg flex items-center justify-center">
                <Sparkles size={12} className="text-ios-orange" />
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Быстрый набор</span>
            </div>
            {discountInfo.total > 0 && (
              <span className="text-xs font-bold text-ios-green flex items-center gap-1">
                <Percent size={10} />
                −{formatPrice(discountInfo.total)}
              </span>
            )}
          </div>
          
          {/* Shelf Grid - 2 rows */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
            {/* Combos - first shelf row */}
            {combos.slice(0, 4).map((combo) => (
              <button
                key={`combo-${combo.id}`}
                onClick={() => handleAddCombo(combo.id)}
                className="group flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-ios-orange hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 bg-ios-orange/10 rounded-lg flex items-center justify-center text-lg mb-1">
                  {combo.icon || '🎁'}
                </div>
                <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {combo.name}
                </div>
                <div className="text-[10px] font-bold text-ios-orange">
                  −{combo.discount}%
                </div>
              </button>
            ))}
            
            {/* Accessories - compact */}
            {accessories.slice(0, 4).map((acc) => (
              <button
                key={`acc-${acc.id}`}
                onClick={() => handleAddAccessory(acc.id)}
                disabled={addedAccessories.has(acc.id)}
                className={`group flex flex-col items-center p-2 rounded-xl border transition-all ${
                  addedAccessories.has(acc.id)
                    ? 'bg-ios-green/10 border-ios-green/30'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-ios-teal hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-1 ${
                  addedAccessories.has(acc.id) ? 'bg-ios-green/20' : 'bg-ios-teal/10'
                }`}>
                  {addedAccessories.has(acc.id) ? <Check size={16} className="text-ios-green" /> : acc.icon}
                </div>
                <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {acc.name}
                </div>
                <div className={`text-[10px] font-bold ${addedAccessories.has(acc.id) ? 'text-ios-green' : 'text-ios-teal'}`}>
                  {acc.price > 0 ? `+${acc.price}` : 'Free'}
                </div>
              </button>
            ))}
            
            {/* Paired products - compact */}
            {recommendations.slice(0, 4).map((product) => (
              <button
                key={`rec-${product.id}`}
                onClick={() => handleAddToCart(product)}
                className="group flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-ios-blue hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 bg-ios-blue/10 rounded-lg flex items-center justify-center text-lg mb-1">
                  {categoryIcons[product.category] || '📦'}
                </div>
                <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                  {product.name}
                </div>
                <div className="text-[10px] font-bold text-ios-blue">
                  {formatPrice(product.price)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Full mode - Shelf layout with expandable sections
  return (
    <div className="bg-themed-secondary border-t border-separator">
      {/* Discount Banner */}
      {discountInfo.total > 0 && (
        <div className="px-4 py-2 bg-ios-green/10 border-b border-ios-green/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-ios-green/20 rounded-full flex items-center justify-center">
                <Percent size={10} className="text-ios-green" />
              </div>
              <span className="text-xs text-ios-green font-medium">
                Скидка применена
              </span>
            </div>
            <span className="text-sm font-bold text-ios-green">
              −{formatPrice(discountInfo.total)}
            </span>
          </div>
        </div>
      )}

      {/* Shelves */}
      <div className="divide-y divide-separator">
        {shelves.map((shelf) => {
          const isExpanded = expandedShelf === shelf.id
          const itemsToShow = isExpanded ? shelf.items : shelf.items.slice(0, 4)
          const hasMore = shelf.items.length > 4
          
          return (
            <div key={shelf.id} className="px-3 py-2">
              {/* Shelf Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {shelf.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 font-medium">
                    {shelf.items.length}
                  </span>
                </div>
                {hasMore && (
                  <button
                    onClick={() => setExpandedShelf(isExpanded ? null : shelf.id)}
                    className="text-[11px] text-ios-blue font-medium flex items-center gap-0.5"
                  >
                    {isExpanded ? 'Свернуть' : 'Ещё'}
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>
              
              {/* Shelf Items Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {itemsToShow.map((item) => {
                  if (shelf.type === 'combo') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddCombo(item.id)}
                        className="group relative flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-ios-orange hover:shadow-lg transition-all"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            dismissCombo(item.id)
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-ios-orange/20 to-ios-orange/5 rounded-xl flex items-center justify-center text-xl mb-1.5">
                          {item.icon || '🎁'}
                        </div>
                        <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate w-full text-center leading-tight">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-gray-400 line-through">{formatPrice(item.totalPrice)}</span>
                          <span className="text-[11px] font-bold text-ios-orange">{formatPrice(item.discountedPrice)}</span>
                        </div>
                        <span className="mt-1 px-1.5 py-0.5 bg-ios-green/15 text-ios-green text-[9px] font-bold rounded">
                          −{item.discount}%
                        </span>
                      </button>
                    )
                  }
                  
                  if (shelf.type === 'accessory') {
                    const isAdded = addedAccessories.has(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddAccessory(item.id)}
                        disabled={isAdded}
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isAdded
                            ? 'bg-ios-green/10 border-ios-green/30'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-ios-teal hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1.5 ${
                          isAdded ? 'bg-ios-green/20' : 'bg-ios-teal/10'
                        }`}>
                          {isAdded ? <Check size={18} className="text-ios-green" /> : item.icon}
                        </div>
                        <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate w-full text-center">
                          {item.name}
                        </div>
                        <div className={`text-[11px] font-bold mt-0.5 ${isAdded ? 'text-ios-green' : 'text-ios-teal'}`}>
                          {item.price > 0 ? `+${formatPrice(item.price)}` : 'Бесплатно'}
                        </div>
                      </button>
                    )
                  }
                  
                  // Product type
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAddToCart(item)}
                      className="group flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-ios-blue hover:shadow-lg transition-all"
                    >
                      <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center text-xl mb-1.5">
                        {categoryIcons[item.category] || '📦'}
                      </div>
                      <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate w-full text-center">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-bold text-ios-blue mt-0.5">
                        {formatPrice(item.price)}
                      </div>
                      {item.reason && (
                        <div className="flex items-center gap-0.5 mt-0.5 text-[9px] text-ios-purple">
                          <Star size={8} className="fill-ios-purple" />
                          <span className="truncate">{item.reason}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Empty state for popular when cart is empty */}
      {showPopular && smartRecs.length === 0 && (
        <div className="px-4 py-6 text-center">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShoppingBag size={20} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Добавьте товар для персональных рекомендаций
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Badge for mobile cart button
 */
export function RecommendationsBadge() {
  const { cart, getRecommendations, getAvailableCombos } = useStore()
  
  const recommendations = getRecommendations()
  const combos = getAvailableCombos()
  
  const totalCount = recommendations.length + combos.length
  
  if (totalCount === 0 || cart.length === 0) return null
  
  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-ios-orange rounded-full flex items-center justify-center shadow-ios">
      <Sparkles size={11} className="text-white" />
    </div>
  )
}
