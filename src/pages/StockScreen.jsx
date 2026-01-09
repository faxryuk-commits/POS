import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ArrowDownCircle, ArrowUpCircle, Search, X, Check, Package, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { HelpButton, WarningTip } from '../components/HelpSystem'

// Category icons
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

export default function StockScreen() {
  const [activeTab, setActiveTab] = useState('movements')
  const [showModal, setShowModal] = useState(false)
  const [movementType, setMovementType] = useState('incoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [comment, setComment] = useState('')

  const { products, stockMovements, addStockMovement, getCurrencySymbol } = useStore()
  const currencySymbol = getCurrencySymbol()
  const formatPrice = (price) => `${price.toLocaleString()} ${currencySymbol}`

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (type) => {
    setMovementType(type)
    setSelectedProduct(null)
    setQuantity('')
    setComment('')
    setSearchQuery('')
    setShowModal(true)
  }

  // Form validation
  const isQuantityValid = () => {
    if (!quantity || parseInt(quantity) <= 0) return false
    if (movementType === 'outgoing' && selectedProduct && parseInt(quantity) > selectedProduct.stock) {
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedProduct || !isQuantityValid()) return

    addStockMovement({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: movementType,
      quantity: parseInt(quantity),
      comment: comment || (movementType === 'incoming' ? 'Поступление товара' : 'Списание товара')
    })

    setShowModal(false)
  }

  return (
    <div className="h-full flex flex-col p-4 bg-themed-primary">
      {/* Incoming/Outgoing Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => openModal('incoming')}
          className="h-20 bg-gradient-to-br from-ios-green/20 to-ios-green/5 border border-ios-green/30 rounded-ios-xl flex items-center justify-center gap-3 hover:from-ios-green/30 hover:to-ios-green/10 transition-all ios-press"
        >
          <ArrowDownCircle size={32} className="text-ios-green" />
          <div className="text-left">
            <div className="font-semibold text-ios-green">Приход</div>
            <div className="text-sm text-themed-secondary">Поступление товара</div>
          </div>
        </button>
        <button
          onClick={() => openModal('outgoing')}
          className="h-20 bg-gradient-to-br from-ios-red/20 to-ios-red/5 border border-ios-red/30 rounded-ios-xl flex items-center justify-center gap-3 hover:from-ios-red/30 hover:to-ios-red/10 transition-all ios-press"
        >
          <ArrowUpCircle size={32} className="text-ios-red" />
          <div className="text-left">
            <div className="font-semibold text-ios-red">Расход</div>
            <div className="text-sm text-themed-secondary">Списание товара</div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-3 sm:px-4 py-2.5 rounded-ios font-semibold transition-all text-sm sm:text-base ios-press ${
            activeTab === 'movements'
              ? 'bg-ios-blue text-white shadow-ios'
              : 'bg-themed-secondary text-themed-primary border border-themed hover:bg-fill-tertiary'
          }`}
        >
          История
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3 sm:px-4 py-2.5 rounded-ios font-semibold transition-all text-sm sm:text-base ios-press ${
            activeTab === 'stock'
              ? 'bg-ios-blue text-white shadow-ios'
              : 'bg-themed-secondary text-themed-primary border border-themed hover:bg-fill-tertiary'
          }`}
        >
          Остатки
        </button>
        <div className="ml-auto">
          <HelpButton module="stock" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden ios-card rounded-ios-xl">
        {activeTab === 'movements' ? (
          <div className="h-full overflow-y-auto">
            {stockMovements.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-themed-tertiary">
                <Clock size={48} className="mb-3 opacity-50" />
                <p>История операций пуста</p>
                <p className="text-sm mt-1">Добавьте приход или расход</p>
              </div>
            ) : (
              <div className="divide-y divide-separator">
                {stockMovements.map((movement) => (
                  <div key={movement.id} className="p-4 flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${movement.type === 'incoming'
                        ? 'bg-ios-green/20 text-ios-green'
                        : 'bg-ios-red/20 text-ios-red'
                      }
                    `}>
                      {movement.type === 'incoming'
                        ? <ArrowDownCircle size={20} />
                        : <ArrowUpCircle size={20} />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-themed-primary">{movement.productName}</div>
                      <div className="text-sm text-themed-secondary">{movement.comment}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${
                        movement.type === 'incoming' ? 'text-ios-green' : 'text-ios-red'
                      }`}>
                        {movement.type === 'incoming' ? '+' : '-'}{movement.quantity} шт
                      </div>
                      <div className="text-xs text-themed-tertiary">
                        {format(new Date(movement.date), 'd MMM, HH:mm', { locale: ru })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-themed-secondary">
                <tr className="text-left text-sm text-themed-secondary">
                  <th className="p-4 font-medium">Товар</th>
                  <th className="p-4 font-medium text-right">Остаток</th>
                  <th className="p-4 font-medium text-right">Сумма на складе</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-separator">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-fill-quaternary transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-fill-tertiary rounded-ios flex items-center justify-center">
                          {categoryIcons[product.category] || '📦'}
                        </div>
                        <span className="font-medium text-themed-primary">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`
                        px-3 py-1 rounded-ios text-sm font-medium
                        ${product.stock === 0
                          ? 'bg-ios-red/20 text-ios-red'
                          : product.stock <= 5
                          ? 'bg-ios-orange/20 text-ios-orange'
                          : 'bg-fill-tertiary text-themed-secondary'
                        }
                      `}>
                        {product.stock} шт
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-themed-secondary">
                      {formatPrice(product.price * product.stock)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-themed-secondary border-t border-separator">
                <tr>
                  <td className="p-4 font-semibold text-themed-primary" colSpan={2}>Итого на складе:</td>
                  <td className="p-4 text-right font-mono font-bold text-ios-blue">
                    {formatPrice(products.reduce((sum, p) => sum + p.price * p.stock, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Incoming/Outgoing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative ios-modal w-full max-w-md">
            <div className="p-5 border-b border-separator flex items-center justify-between">
              <h3 className="text-ios-title3 font-semibold flex items-center gap-2 text-themed-primary">
                {movementType === 'incoming' ? (
                  <>
                    <ArrowDownCircle className="text-ios-green" />
                    Приход товара
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="text-ios-red" />
                    Расход товара
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary transition-colors ios-press"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Product Search */}
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Товар</label>
                {selectedProduct ? (
                  <div className="flex items-center gap-3 p-3 ios-card-grouped rounded-ios-lg">
                    <Package className="text-ios-blue" size={20} />
                    <div className="flex-1">
                      <div className="font-medium text-themed-primary">{selectedProduct.name}</div>
                      <div className="text-sm text-themed-secondary">
                        Текущий остаток: {selectedProduct.stock} шт
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="text-themed-tertiary hover:text-themed-primary ios-press"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-tertiary" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 ios-input"
                      placeholder="Найти товар..."
                    />
                    {searchQuery && (
                      <div className="absolute top-full left-0 right-0 mt-2 ios-card-grouped rounded-ios-lg max-h-48 overflow-y-auto z-10 shadow-ios-lg">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(product)
                              setSearchQuery('')
                            }}
                            className="w-full p-3 text-left hover:bg-fill-tertiary flex items-center justify-between text-themed-primary"
                          >
                            <span>{product.name}</span>
                            <span className="text-sm text-themed-secondary">{product.stock} шт</span>
                          </button>
                        ))}
                        {filteredProducts.length === 0 && (
                          <div className="p-3 text-center text-themed-tertiary">
                            Товар не найден
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Количество</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  max={movementType === 'outgoing' && selectedProduct ? selectedProduct.stock : undefined}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="10"
                />
                {movementType === 'outgoing' && selectedProduct && quantity && parseInt(quantity) > selectedProduct.stock && (
                  <WarningTip className="mt-2">
                    На складе только {selectedProduct.stock} шт! Нельзя списать больше.
                  </WarningTip>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Комментарий</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full h-12 px-4 ios-input"
                  placeholder={movementType === 'incoming' ? 'Поставка от...' : 'Причина списания...'}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedProduct || !isQuantityValid()}
                className={`
                  w-full h-12 rounded-ios-lg font-semibold flex items-center justify-center gap-2 transition-all ios-press mt-6
                  ${selectedProduct && isQuantityValid()
                    ? movementType === 'incoming'
                      ? 'bg-ios-green text-white hover:bg-ios-green/90'
                      : 'bg-ios-red text-white hover:bg-ios-red/90'
                    : 'bg-fill-tertiary text-themed-tertiary cursor-not-allowed'
                  }
                `}
              >
                <Check size={20} />
                {movementType === 'incoming' ? 'Оприходовать' : 'Списать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
