import { useState, memo, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { useDiscountStore } from '../store/discountStore'
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, X, Check, ShoppingCart, ScanBarcode, Percent, Ticket, ChevronUp, ChevronDown, Receipt, Clock, ChevronRight, Printer } from 'lucide-react'
import { HelpButton, WarningTip } from '../components/HelpSystem'
import Recommendations from '../components/Recommendations'
import SwipeToDelete from '../components/SwipeToDelete'
import { ProductCardSkeleton, CartItemSkeleton } from '../components/Skeleton'
import { printReceipt } from '../services/printService'

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

// Мемоизированная карточка товара для оптимизации рендеринга
const ProductGridItem = memo(function ProductGridItem({ 
  product, 
  cartQuantity, 
  isAvailable, 
  availabilityInfo, 
  onAdd, 
  formatPrice 
}) {
  return (
    <button
      onClick={() => product.stock > 0 && isAvailable && onAdd(product)}
      disabled={product.stock <= 0 || !isAvailable}
      className={`
        relative p-3 rounded-ios-xl ios-press overflow-visible
        ${product.stock <= 0 || !isAvailable
          ? 'bg-themed-tertiary opacity-50 cursor-not-allowed'
          : 'ios-card-interactive'
        }
      `}
    >
      {/* Cart Badge */}
      {cartQuantity > 0 && (
        <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 bg-ios-blue rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-ios z-10">
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
  )
})

export default function POSScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(null)
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  
  const {
    cart,
    searchProducts,
    selectedCategory,
    setSelectedCategory,
    categories,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    completeSale,
    getCurrencySymbol,
    setScannerOpen,
    isProductAvailable,
    getProductAvailabilityInfo,
    transactions
  } = useStore()

  const { getTotalDiscount, applyPromocode, removePromocode, appliedPromocode } = useDiscountStore()

  const filteredProducts = searchProducts(searchQuery)
  const cartTotal = getCartTotal()
  const cartCount = getCartCount()
  const currencySymbol = getCurrencySymbol()
  
  // Расчёт скидок
  const discountInfo = getTotalDiscount(cart, cartTotal)
  const finalTotal = Math.max(0, cartTotal - discountInfo.total)
  const change = receivedAmount ? parseFloat(receivedAmount) - finalTotal : 0

  const handlePayment = (method) => {
    const transaction = completeSale(method, method === 'cash' ? parseFloat(receivedAmount) || cartTotal : null)
    setPaymentSuccess(transaction)
    setShowPayment(false)
    setShowMobileCart(false)
    setReceivedAmount('')
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    setTimeout(() => setPaymentSuccess(null), 3000)
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const formatPrice = (price) => {
    return `${price.toLocaleString()} ${currencySymbol}`
  }

  // iOS-style Cart Content
  const CartContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full min-h-0">
      {/* Header - Fixed */}
      <div className={`
        flex-shrink-0 px-5 py-4 flex items-center justify-between
        ${isMobile ? 'sticky top-0 ios-glass-thick z-10' : 'border-b border-separator'}
      `}>
        <div className="flex items-center gap-3">
          <h2 className="text-ios-title3 font-semibold text-themed-primary">Корзина</h2>
          {cartCount > 0 && (
            <span className="px-2.5 py-0.5 bg-ios-blue/20 text-ios-blue rounded-full text-[13px] font-semibold">
              {cartCount}
            </span>
          )}
          {/* История чеков */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 text-ios-blue hover:bg-ios-blue/10 rounded-ios transition-colors"
            title="История чеков"
          >
            <Receipt size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2.5 text-ios-red hover:bg-ios-red/10 rounded-ios transition-colors ios-press"
            >
              <Trash2 size={20} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setShowMobileCart(false)}
              className="p-2.5 text-themed-tertiary hover:bg-fill-tertiary rounded-ios transition-colors ios-press"
            >
              <ChevronDown size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items - Scrollable */}
      <div 
        data-scrollable
        className={`flex-1 min-h-0 overflow-y-auto scroll-stable px-4 py-3 ${isMobile ? 'max-h-[40vh]' : ''}`}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {cart.length === 0 ? (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-fill-tertiary rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={36} className="text-themed-tertiary" />
            </div>
            <p className="text-themed-primary text-ios-headline font-semibold">Корзина пуста</p>
            <p className="text-themed-secondary text-ios-subhead mt-1">
              Выберите товары {isMobile ? 'выше' : 'слева'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <SwipeToDelete 
                key={item.id} 
                onDelete={() => removeFromCart(item.id)}
              >
                <div className="ios-card-grouped p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-ios-body font-medium text-themed-primary truncate">
                        {item.name}
                      </div>
                      <div className="text-ios-caption1 text-themed-secondary">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-ios-headline font-semibold text-ios-blue ml-3">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-fill-tertiary rounded-ios overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-ios-blue hover:bg-fill-secondary transition-colors ios-press"
                      >
                        <Minus size={18} strokeWidth={2.5} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-10 h-9 bg-transparent text-center text-ios-body font-semibold text-themed-primary focus:outline-none"
                      />
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-ios-blue hover:bg-fill-secondary transition-colors ios-press"
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto w-9 h-9 text-ios-red hover:bg-ios-red/10 rounded-ios flex items-center justify-center transition-colors ios-press"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </SwipeToDelete>
            ))}
          </div>
        )}
      </div>

      {/* Total & Checkout - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 ios-glass-thick border-t border-separator">
        {/* Discount Info */}
        {discountInfo.total > 0 && (
          <div className="flex items-center justify-between mb-2 text-ios-green">
            <span className="flex items-center gap-1.5 text-ios-subhead">
              <Percent size={16} />
              Скидка
            </span>
            <span className="text-ios-body font-semibold">−{formatPrice(discountInfo.total)}</span>
          </div>
        )}
        
        {/* Subtotal */}
        {discountInfo.total > 0 && (
          <div className="flex items-center justify-between mb-1 text-themed-tertiary">
            <span className="text-ios-footnote">Подитого</span>
            <span className="text-ios-footnote line-through">{formatPrice(cartTotal)}</span>
          </div>
        )}
        
        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-themed-secondary text-ios-body">Итого</span>
          <span className="text-ios-title2 font-bold text-themed-primary">
            {formatPrice(finalTotal)}
          </span>
        </div>
        
        {/* Pay Button */}
        <button
          onClick={() => setShowPayment(true)}
          disabled={cart.length === 0}
          className={`
            w-full h-[54px] rounded-ios-xl font-semibold text-[17px] transition-all ios-press
            ${cart.length > 0
              ? 'bg-ios-green text-white shadow-ios-lg active:bg-ios-green/90'
              : 'bg-fill-tertiary text-themed-tertiary cursor-not-allowed'
            }
          `}
        >
          {cart.length > 0 ? `💳 Оплатить ${formatPrice(finalTotal)}` : 'Оплатить'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col md:flex-row bg-themed-primary">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="flex gap-3 p-4 pb-2">
          <div className="relative flex-1 flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus-within:border-ios-blue focus-within:ring-2 focus-within:ring-ios-blue/30 transition-all">
            <div className="pl-4 text-gray-400 dark:text-gray-500 flex-shrink-0">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск товара..."
              className="w-full h-[44px] pl-3 pr-4 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <HelpButton module="pos" />
          <button
            onClick={() => setScannerOpen(true)}
            className="w-[44px] h-[44px] bg-ios-blue/10 rounded-ios flex items-center justify-center text-ios-blue hover:bg-ios-blue/20 transition-colors ios-press"
          >
            <ScanBarcode size={22} />
          </button>
        </div>

        {/* Categories - iOS Segmented Control Style */}
        <div className="px-4 pb-3 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  flex items-center gap-1.5 flex-shrink-0 px-4 py-2.5 rounded-ios-full text-ios-subhead font-semibold transition-all ios-press shadow-sm
                  ${selectedCategory === cat
                    ? 'bg-ios-blue text-white shadow-ios'
                    : 'bg-themed-secondary text-themed-primary border border-themed hover:bg-themed-tertiary'
                  }
                `}
              >
                <span className="text-base">{categoryIcons[cat] || '📦'}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pt-2">
            {filteredProducts.map((product) => {
              const cartItem = cart.find(item => item.id === product.id)
              
              return (
                <ProductGridItem
                  key={product.id}
                  product={product}
                  cartQuantity={cartItem?.quantity || 0}
                  isAvailable={isProductAvailable(product.id)}
                  availabilityInfo={getProductAvailabilityInfo(product.id)}
                  onAdd={handleAddToCart}
                  formatPrice={formatPrice}
                />
              )
            })}
          </div>
        </div>

        {/* Compact Recommendations Bar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block flex-shrink-0">
          <Recommendations compact />
        </div>
      </div>

      {/* Desktop Cart Panel */}
      <div className="hidden md:flex w-80 lg:w-[360px] bg-themed-secondary border-l border-themed flex-col">
        <CartContent />
      </div>

      {/* Mobile Cart Button */}
      <div className="md:hidden fixed bottom-[85px] left-4 right-4 z-40">
        <button
          onClick={() => setShowMobileCart(true)}
          className={`
            w-full h-[56px] rounded-ios-xl font-semibold flex items-center justify-between px-5 transition-all ios-press shadow-ios-lg
            ${cartCount > 0
              ? 'bg-ios-green text-white'
              : 'bg-themed-secondary border border-themed text-themed-primary'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 bg-white rounded-full text-[11px] font-bold text-ios-green flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-ios-body">{cartCount > 0 ? 'Корзина' : 'Корзина пуста'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ios-headline font-bold">{formatPrice(finalTotal)}</span>
            <ChevronUp size={22} />
          </div>
        </button>
      </div>

      {/* Mobile Cart Sheet */}
      {showMobileCart && (
        <div 
          className="md:hidden fixed inset-0 z-50"
          onTouchMove={(e) => {
            // Предотвращаем прокрутку фона
            const target = e.target
            const scrollableParent = target.closest('[data-scrollable]')
            if (!scrollableParent) {
              e.preventDefault()
            }
          }}
        >
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-themed-secondary rounded-t-[20px] max-h-[85vh] overflow-hidden flex flex-col animate-ios-slide-up scroll-isolated">
            <div className="ios-sheet-handle" />
            <CartContent isMobile />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowPayment(false)
              setReceivedAmount('')
              setPromoError('')
            }}
          />
          <div className="relative ios-modal w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 ios-glass-thick px-5 py-4 border-b border-separator flex items-center justify-between z-10">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">Оплата</h3>
              <button
                onClick={() => {
                  setShowPayment(false)
                  setReceivedAmount('')
                  setPromoError('')
                }}
                className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary transition-colors ios-press"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Total Display */}
              <div className="text-center py-4">
                {discountInfo.total > 0 && (
                  <div className="text-themed-tertiary line-through text-ios-subhead mb-1">
                    {formatPrice(cartTotal)}
                  </div>
                )}
                <div className="text-themed-secondary text-ios-footnote mb-1">К оплате</div>
                <div className="text-ios-largeTitle font-bold text-ios-blue">
                  {formatPrice(finalTotal)}
                </div>
                {discountInfo.total > 0 && (
                  <div className="text-ios-green text-ios-footnote mt-2 flex items-center justify-center gap-1">
                    <Percent size={14} />
                    Скидка: −{formatPrice(discountInfo.total)}
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="ios-card-grouped p-4">
                <label className="flex items-center gap-2 text-ios-footnote text-themed-secondary mb-3">
                  <Ticket size={16} />
                  Промокод
                </label>
                {appliedPromocode ? (
                  <div className="flex items-center justify-between p-3 bg-ios-green/10 border border-ios-green/30 rounded-ios">
                    <div>
                      <div className="font-mono font-bold text-ios-green text-ios-body">{appliedPromocode.code}</div>
                      <div className="text-ios-caption1 text-themed-secondary">{appliedPromocode.name}</div>
                    </div>
                    <button
                      onClick={() => removePromocode()}
                      className="p-2 text-themed-tertiary hover:text-ios-red transition-colors ios-press"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase())
                        setPromoError('')
                      }}
                      placeholder="Введите код"
                      className="flex-1 ios-input font-mono uppercase"
                    />
                    <button
                      onClick={() => {
                        const result = applyPromocode(promoInput)
                        if (!result.success) {
                          setPromoError(result.error)
                        } else {
                          setPromoInput('')
                        }
                      }}
                      disabled={!promoInput}
                      className="ios-btn ios-btn-primary disabled:opacity-50"
                    >
                      ОК
                    </button>
                  </div>
                )}
                {promoError && (
                  <div className="mt-2 text-ios-red text-ios-caption1">{promoError}</div>
                )}
              </div>

              {/* Cash Input */}
              <div className="ios-card-grouped p-4">
                <label className="flex items-center gap-2 text-ios-footnote text-themed-secondary mb-3">
                  <Banknote size={16} />
                  Получено наличными
                </label>
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder={finalTotal.toString()}
                  className="w-full h-14 ios-input text-center text-ios-title3 font-bold"
                />
                {receivedAmount && parseFloat(receivedAmount) >= finalTotal && (
                  <div className="mt-3 text-center">
                    <span className="text-themed-secondary text-ios-subhead">Сдача: </span>
                    <span className="text-ios-green text-ios-headline font-bold">{formatPrice(change)}</span>
                  </div>
                )}
                {receivedAmount && parseFloat(receivedAmount) < finalTotal && (
                  <div className="mt-3 p-3 bg-ios-orange/10 border border-ios-orange/30 rounded-ios text-ios-orange text-ios-footnote text-center">
                    Не хватает {formatPrice(finalTotal - parseFloat(receivedAmount))}
                  </div>
                )}
              </div>
              
              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePayment('cash')}
                  disabled={receivedAmount && parseFloat(receivedAmount) < finalTotal}
                  className={`
                    flex flex-col items-center gap-3 p-5 rounded-ios-xl transition-all ios-press
                    ${!receivedAmount || parseFloat(receivedAmount) >= finalTotal
                      ? 'ios-card-grouped hover:bg-fill-secondary border-2 border-transparent hover:border-ios-green'
                      : 'ios-card-grouped opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="w-14 h-14 bg-ios-green/20 rounded-full flex items-center justify-center">
                    <Banknote size={28} className="text-ios-green" />
                  </div>
                  <span className="text-ios-body font-semibold text-themed-primary">Наличные</span>
                </button>
                <button
                  onClick={() => handlePayment('card')}
                  className="flex flex-col items-center gap-3 p-5 ios-card-grouped rounded-ios-xl hover:bg-fill-secondary transition-all ios-press border-2 border-transparent hover:border-ios-blue"
                >
                  <div className="w-14 h-14 bg-ios-blue/20 rounded-full flex items-center justify-center">
                    <CreditCard size={28} className="text-ios-blue" />
                  </div>
                  <span className="text-ios-body font-semibold text-themed-primary">Карта</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast - Dynamic Island Style */}
      {paymentSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-ios-spring">
          <div className="bg-black rounded-[22px] px-5 py-3 flex items-center gap-3 shadow-ios-xl border border-white/10">
            <div className="w-10 h-10 bg-ios-green rounded-full flex items-center justify-center">
              <Check size={22} className="text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className="text-white text-ios-body font-semibold">Оплата принята</div>
              <div className="text-gray-400 text-ios-caption1">
                {paymentSuccess.receiptNumber}
                {paymentSuccess.change > 0 && ` • Сдача: ${formatPrice(paymentSuccess.change)}`}
              </div>
            </div>
            <button
              onClick={() => {
                printReceipt(paymentSuccess, {
                  storeName: 'POS Store',
                  currency: currencySymbol
                })
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Печать чека"
            >
              <Printer size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Receipt History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ios-blue/20 rounded-full flex items-center justify-center">
                  <Receipt size={20} className="text-ios-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">История чеков</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Последние продажи</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Receipt List */}
            <div className="overflow-y-auto max-h-[calc(80vh-88px)]">
              {transactions.filter(t => t.type === 'sale').length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Пока нет продаж</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {transactions
                    .filter(t => t.type === 'sale')
                    .slice(0, 20)
                    .map((receipt) => (
                      <div 
                        key={receipt.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {receipt.receiptNumber}
                            </span>
                            <span className={`
                              px-2 py-0.5 rounded-full text-xs font-medium
                              ${receipt.paymentMethod === 'cash' 
                                ? 'bg-ios-green/20 text-ios-green' 
                                : 'bg-ios-blue/20 text-ios-blue'
                              }
                            `}>
                              {receipt.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ios-blue">
                              {formatPrice(receipt.total)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                printReceipt(receipt, {
                                  storeName: 'POS Store',
                                  currency: currencySymbol
                                })
                              }}
                              className="p-2 text-gray-500 hover:text-ios-blue hover:bg-ios-blue/10 rounded-lg transition-colors"
                              title="Печать чека"
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            <span>
                              {new Date(receipt.date).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className="text-gray-400 dark:text-gray-500">
                            {receipt.items.length} товар{receipt.items.length === 1 ? '' : receipt.items.length < 5 ? 'а' : 'ов'}
                          </span>
                        </div>
                        {receipt.items.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {receipt.items.map(i => i.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
