import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useCatalogStore } from '../store/catalogStore'
import { 
  X, Plus, Minus, Check, AlertTriangle, Info, 
  ChevronDown, ChevronUp, Flame, Leaf, Package
} from 'lucide-react'

/**
 * Детальная карточка товара с модификаторами
 * Показывается при добавлении товара в корзину если есть модификаторы
 */
export default function ProductCard({ product, onClose, onAdd }) {
  const { getCurrencySymbol } = useStore()
  const { getModifiersForProduct, getProductCard, getVariants } = useCatalogStore()
  
  const currencySymbol = getCurrencySymbol()
  const card = getProductCard(product.id)
  const modifierGroups = getModifiersForProduct(product.id)
  const variants = getVariants(product.id)
  
  // Выбранные модификаторы
  const [selectedModifiers, setSelectedModifiers] = useState({})
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [showDetails, setShowDetails] = useState(false)
  
  // Расчёт цены
  const getModifierPrice = () => {
    let price = 0
    Object.entries(selectedModifiers).forEach(([groupId, modifiers]) => {
      if (Array.isArray(modifiers)) {
        modifiers.forEach(mod => price += mod.price)
      } else if (modifiers) {
        price += modifiers.price
      }
    })
    return price
  }
  
  const variantPrice = selectedVariant?.priceDiff || 0
  const modifierPrice = getModifierPrice()
  const totalPrice = (product.price + variantPrice + modifierPrice) * quantity
  
  // Проверка обязательных модификаторов
  const requiredGroups = modifierGroups.filter(g => g.required)
  const allRequiredSelected = requiredGroups.every(g => selectedModifiers[g.id])
  
  // Обработка выбора модификатора
  const handleModifierSelect = (group, modifier) => {
    if (group.type === 'single') {
      setSelectedModifiers(prev => ({
        ...prev,
        [group.id]: modifier
      }))
    } else {
      // Множественный выбор
      setSelectedModifiers(prev => {
        const current = prev[group.id] || []
        const isSelected = current.some(m => m.id === modifier.id)
        return {
          ...prev,
          [group.id]: isSelected
            ? current.filter(m => m.id !== modifier.id)
            : [...current, modifier]
        }
      })
    }
  }
  
  // Добавить в корзину
  const handleAdd = () => {
    if (!allRequiredSelected) return
    
    const cartItem = {
      ...product,
      variant: selectedVariant,
      modifiers: selectedModifiers,
      totalPrice: product.price + variantPrice + modifierPrice,
      quantity
    }
    
    onAdd(cartItem)
    onClose()
  }
  
  const formatPrice = (price) => `${price.toLocaleString()} ${currencySymbol}`
  
  // Получаем иконку категории
  const getCategoryIcon = (category) => {
    const icons = {
      'Напитки': '🥤',
      'Сладости': '🍫',
      'Хлеб': '🍞',
      'Молочные': '🥛',
      'Фрукты': '🍎',
      'Снеки': '🍿',
      'Табак': '🚬',
      'Алкоголь': '🍺',
    }
    return icons[category] || '📦'
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-surface-900 w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Заголовок */}
        <div className="flex-shrink-0 p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center text-2xl">
              {getCategoryIcon(product.category)}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-sm text-surface-400">{product.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Варианты товара */}
          {variants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-surface-400 mb-2">Вариант</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`
                    px-4 py-2 rounded-xl border transition-all
                    ${!selectedVariant
                      ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                      : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                    }
                  `}
                >
                  Стандарт
                </button>
                {variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`
                      px-4 py-2 rounded-xl border transition-all
                      ${selectedVariant?.id === variant.id
                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                        : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                      }
                    `}
                  >
                    {variant.name}
                    {variant.priceDiff > 0 && (
                      <span className="ml-2 text-xs text-surface-400">
                        +{formatPrice(variant.priceDiff)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Модификаторы */}
          {modifierGroups.map(group => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-surface-400">{group.name}</h3>
                {group.required && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                    Обязательно
                  </span>
                )}
                {group.type === 'multiple' && (
                  <span className="px-2 py-0.5 bg-surface-700 text-surface-400 rounded-full text-xs">
                    Можно выбрать несколько
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {group.modifiers.map(mod => {
                  const isSelected = group.type === 'single'
                    ? selectedModifiers[group.id]?.id === mod.id
                    : (selectedModifiers[group.id] || []).some(m => m.id === mod.id)
                  
                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleModifierSelect(group, mod)}
                      className={`
                        px-4 py-2 rounded-xl border transition-all flex items-center gap-2
                        ${isSelected
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'bg-surface-800 border-surface-700 hover:border-surface-600'
                        }
                      `}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{mod.name}</span>
                      {mod.price > 0 && (
                        <span className="text-xs text-surface-400">
                          +{formatPrice(mod.price)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          
          {/* Детали товара */}
          {card && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between py-2 text-surface-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Info size={16} />
                  Подробнее о товаре
                </span>
                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {showDetails && (
                <div className="space-y-3 pt-2 animate-slide-up">
                  {card.description && (
                    <p className="text-sm text-surface-300">{card.description}</p>
                  )}
                  
                  {/* Пищевая ценность */}
                  {card.nutrition && (card.nutrition.calories > 0 || card.nutrition.protein > 0) && (
                    <div className="bg-surface-800 rounded-xl p-3">
                      <h4 className="text-xs font-medium text-surface-400 mb-2 flex items-center gap-1">
                        <Flame size={14} />
                        Пищевая ценность (на 100г/мл)
                      </h4>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-amber-400">{card.nutrition.calories}</div>
                          <div className="text-[10px] text-surface-500">ккал</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{card.nutrition.protein}г</div>
                          <div className="text-[10px] text-surface-500">белки</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{card.nutrition.fat}г</div>
                          <div className="text-[10px] text-surface-500">жиры</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{card.nutrition.carbs}г</div>
                          <div className="text-[10px] text-surface-500">углеводы</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Аллергены */}
                  {card.allergens && card.allergens.length > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-400">Аллергены</h4>
                        <p className="text-sm text-surface-300">{card.allergens.join(', ')}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Состав */}
                  {card.ingredients && card.ingredients.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-surface-400 mb-1 flex items-center gap-1">
                        <Leaf size={14} />
                        Состав
                      </h4>
                      <p className="text-sm text-surface-300">{card.ingredients.join(', ')}</p>
                    </div>
                  )}
                  
                  {/* Дополнительная информация */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {card.weight && (
                      <div className="bg-surface-800 rounded-lg p-2">
                        <span className="text-surface-500">Вес: </span>
                        <span>{card.weight}</span>
                      </div>
                    )}
                    {card.manufacturer && (
                      <div className="bg-surface-800 rounded-lg p-2">
                        <span className="text-surface-500">Производитель: </span>
                        <span>{card.manufacturer}</span>
                      </div>
                    )}
                    {card.shelfLife && (
                      <div className="bg-surface-800 rounded-lg p-2">
                        <span className="text-surface-500">Срок годности: </span>
                        <span>{card.shelfLife}</span>
                      </div>
                    )}
                    {card.sku && (
                      <div className="bg-surface-800 rounded-lg p-2">
                        <span className="text-surface-500">SKU: </span>
                        <span>{card.sku}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Теги */}
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-surface-800 rounded-lg text-xs text-surface-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Футер с количеством и добавлением */}
        <div className="flex-shrink-0 p-4 border-t border-surface-800 bg-surface-800/50">
          {/* Предупреждение если не выбраны обязательные модификаторы */}
          {!allRequiredSelected && (
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-3">
              <AlertTriangle size={16} />
              <span>Выберите обязательные опции</span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {/* Количество */}
            <div className="flex items-center gap-2 bg-surface-800 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-700 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Кнопка добавить */}
            <button
              onClick={handleAdd}
              disabled={!allRequiredSelected}
              className={`
                flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                ${allRequiredSelected
                  ? 'bg-primary-500 text-black hover:bg-primary-400'
                  : 'bg-surface-700 text-surface-500 cursor-not-allowed'
                }
              `}
            >
              <Plus size={20} />
              Добавить за {formatPrice(totalPrice)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
