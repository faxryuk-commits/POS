import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useDiscountStore, DISCOUNT_TYPES, CONDITION_TYPES, DISCOUNT_TEMPLATES } from '../store/discountStore'
import { 
  Percent, Tag, Clock, Calendar, Gift, Plus, Edit2, Trash2, 
  X, Save, ToggleLeft, ToggleRight, Zap, Copy, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp, Sparkles, Ticket
} from 'lucide-react'
import { HelpButton } from '../components/HelpSystem'
import { useConfirm } from '../components/ConfirmDialog'

export default function DiscountsScreen() {
  const [activeTab, setActiveTab] = useState('discounts')
  const [showModal, setShowModal] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)

  const { getCurrencySymbol, categories } = useStore()
  const {
    discounts, promocodes,
    addDiscount, updateDiscount, deleteDiscount, toggleDiscount,
    addPromocode, deletePromocode,
    createFromTemplate
  } = useDiscountStore()

  const currencySymbol = getCurrencySymbol()
  const formatPrice = (price) => `${price?.toLocaleString() || 0} ${currencySymbol}`
  const confirm = useConfirm()

  // Discount form
  const [discountForm, setDiscountForm] = useState({
    name: '',
    description: '',
    type: DISCOUNT_TYPES.PERCENT,
    value: 10,
    conditions: [],
    isActive: true,
    isAutomatic: true,
    priority: 1,
    stackable: false,
  })

  // Promo form
  const [promoForm, setPromoForm] = useState({
    code: '',
    name: '',
    description: '',
    type: DISCOUNT_TYPES.PERCENT,
    value: 10,
    isActive: true,
    maxUses: 100,
    minAmount: 0,
    validTo: '',
  })

  const openDiscountModal = (discount = null) => {
    if (discount) {
      setDiscountForm({ ...discount })
      setEditingItem(discount.id)
    } else {
      setDiscountForm({
        name: '',
        description: '',
        type: DISCOUNT_TYPES.PERCENT,
        value: 10,
        conditions: [],
        isActive: true,
        isAutomatic: true,
        priority: 1,
        stackable: false,
      })
      setEditingItem(null)
    }
    setShowModal('discount')
  }

  const saveDiscount = () => {
    if (!discountForm.name) return
    
    if (editingItem) {
      updateDiscount(editingItem, discountForm)
    } else {
      addDiscount(discountForm)
    }
    setShowModal(null)
  }

  const openPromoModal = (promo = null) => {
    if (promo) {
      setPromoForm({ ...promo })
      setEditingItem(promo.id)
    } else {
      setPromoForm({
        code: '',
        name: '',
        description: '',
        type: DISCOUNT_TYPES.PERCENT,
        value: 10,
        isActive: true,
        maxUses: 100,
        minAmount: 0,
        validTo: '',
      })
      setEditingItem(null)
    }
    setShowModal('promo')
  }

  const savePromocode = () => {
    if (!promoForm.code || !promoForm.name) return
    addPromocode(promoForm)
    setShowModal(null)
  }

  const applyTemplate = (template) => {
    setDiscountForm({
      ...discountForm,
      ...template.template,
      name: '',
      description: template.description,
    })
    setShowTemplates(false)
    setShowModal('discount')
  }

  // Add condition
  const addCondition = (type) => {
    let defaultValue
    switch (type) {
      case CONDITION_TYPES.MIN_AMOUNT:
        defaultValue = 500
        break
      case CONDITION_TYPES.MIN_QUANTITY:
        defaultValue = 3
        break
      case CONDITION_TYPES.TIME_RANGE:
        defaultValue = { from: '14:00', to: '17:00' }
        break
      case CONDITION_TYPES.DAY_OF_WEEK:
        defaultValue = [1, 2, 3, 4, 5]
        break
      case CONDITION_TYPES.CATEGORY:
        defaultValue = categories[1] || ''
        break
      default:
        defaultValue = null
    }
    
    setDiscountForm({
      ...discountForm,
      conditions: [...discountForm.conditions, { type, value: defaultValue }]
    })
  }

  const removeCondition = (index) => {
    setDiscountForm({
      ...discountForm,
      conditions: discountForm.conditions.filter((_, i) => i !== index)
    })
  }

  const updateCondition = (index, value) => {
    const updated = [...discountForm.conditions]
    updated[index] = { ...updated[index], value }
    setDiscountForm({ ...discountForm, conditions: updated })
  }

  const getConditionLabel = (condition) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    switch (condition.type) {
      case CONDITION_TYPES.MIN_AMOUNT:
        return `Сумма от ${formatPrice(condition.value)}`
      case CONDITION_TYPES.MIN_QUANTITY:
        return `От ${condition.value} шт.`
      case CONDITION_TYPES.TIME_RANGE:
        return `${condition.from || condition.value?.from} - ${condition.to || condition.value?.to}`
      case CONDITION_TYPES.DAY_OF_WEEK:
        return (condition.value || []).map(d => days[d]).join(', ')
      case CONDITION_TYPES.CATEGORY:
        return `Категория: ${condition.value}`
      default:
        return ''
    }
  }

  const tabs = [
    { id: 'discounts', label: 'Скидки', icon: Percent, count: discounts.length },
    { id: 'promocodes', label: 'Промокоды', icon: Ticket, count: promocodes.length },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-themed-primary">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-themed">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ios-orange/20 rounded-ios-lg flex items-center justify-center">
              <Percent size={20} className="text-ios-orange" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-themed-primary">Скидки</h1>
              <p className="text-sm text-themed-secondary">Управление скидками и промокодами</p>
            </div>
          </div>
          <HelpButton module="settings" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-ios-lg font-semibold transition-all ios-press
                ${activeTab === tab.id
                  ? 'bg-ios-orange text-white shadow-ios'
                  : 'bg-themed-secondary text-themed-primary border border-themed hover:bg-fill-tertiary'
                }
              `}
            >
              <tab.icon size={18} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-ios-full text-xs font-bold ${activeTab === tab.id ? 'bg-white/25' : 'bg-fill-tertiary text-themed-secondary'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ============ DISCOUNTS ============ */}
        {activeTab === 'discounts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-themed-secondary text-sm">
                Автоматические скидки применяются при выполнении условий
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="h-10 px-4 bg-fill-tertiary text-themed-secondary rounded-ios-lg font-medium flex items-center gap-2 hover:bg-fill-secondary transition-all ios-press"
                >
                  <Sparkles size={18} />
                  Шаблоны
                </button>
                <button
                  onClick={() => openDiscountModal()}
                  className="h-10 px-4 bg-ios-orange text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-orange/90 transition-all ios-press"
                >
                  <Plus size={18} />
                  Создать
                </button>
              </div>
            </div>

            {/* Templates */}
            {showTemplates && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 ios-card-grouped rounded-ios-xl">
                <p className="col-span-full text-sm text-themed-secondary mb-2">Быстрое создание из шаблона:</p>
                {DISCOUNT_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="p-3 bg-fill-tertiary rounded-ios-lg hover:bg-fill-secondary transition-all text-left ios-press"
                  >
                    <div className="font-medium text-sm mb-1 text-themed-primary">{tpl.name}</div>
                    <div className="text-xs text-themed-secondary">{tpl.description}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4">
              {discounts.map(discount => (
                <div
                  key={discount.id}
                  className={`
                    ios-card rounded-ios-xl p-4 transition-all
                    ${discount.isActive ? '' : 'opacity-60'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-ios-lg flex items-center justify-center text-xl flex-shrink-0
                      ${discount.type === DISCOUNT_TYPES.PERCENT ? 'bg-ios-orange/20' : 'bg-ios-green/20'}
                    `}>
                      {discount.type === DISCOUNT_TYPES.PERCENT ? '🏷️' : 
                       discount.type === DISCOUNT_TYPES.BUY_X_GET_Y ? '🎁' : '💰'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-themed-primary">{discount.name}</h3>
                        <span className={`
                          px-2 py-0.5 rounded-ios-full text-xs font-bold
                          ${discount.isActive ? 'bg-ios-green/20 text-ios-green' : 'bg-fill-tertiary text-themed-secondary'}
                        `}>
                          {discount.isActive ? 'Активна' : 'Отключена'}
                        </span>
                        {discount.isAutomatic && (
                          <span className="px-2 py-0.5 bg-ios-blue/20 text-ios-blue rounded-ios-full text-xs">
                            Авто
                          </span>
                        )}
                        {discount.stackable && (
                          <span className="px-2 py-0.5 bg-ios-purple/20 text-ios-purple rounded-ios-full text-xs">
                            Суммируется
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-themed-secondary mb-2">{discount.description}</p>
                      
                      {/* Conditions */}
                      {discount.conditions && discount.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {discount.conditions.map((cond, idx) => (
                            <span key={idx} className="px-2 py-1 bg-fill-tertiary rounded-ios text-xs flex items-center gap-1 text-themed-primary">
                              {cond.type === CONDITION_TYPES.TIME_RANGE && <Clock size={12} />}
                              {cond.type === CONDITION_TYPES.DAY_OF_WEEK && <Calendar size={12} />}
                              {getConditionLabel(cond)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-lg font-bold text-ios-orange">
                        {discount.type === DISCOUNT_TYPES.PERCENT && `-${discount.value}%`}
                        {discount.type === DISCOUNT_TYPES.FIXED && `-${formatPrice(discount.value)}`}
                        {discount.type === DISCOUNT_TYPES.BUY_X_GET_Y && 
                          `${discount.value?.buyX}+${discount.value?.getY} бесплатно`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleDiscount(discount.id)}
                        className="p-2 rounded-ios hover:bg-fill-tertiary transition-colors ios-press"
                      >
                        {discount.isActive ? (
                          <ToggleRight size={24} className="text-ios-green" />
                        ) : (
                          <ToggleLeft size={24} className="text-themed-tertiary" />
                        )}
                      </button>
                      <button
                        onClick={() => openDiscountModal(discount)}
                        className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-themed-primary transition-colors ios-press"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Удалить скидку?',
                            message: `Скидка "${discount.name}" будет удалена`,
                            confirmText: 'Удалить',
                            type: 'danger'
                          })
                          if (confirmed) deleteDiscount(discount.id)
                        }}
                        className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-red transition-colors ios-press"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {discounts.length === 0 && (
                <div className="text-center py-12 text-themed-tertiary">
                  <Percent size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет скидок</p>
                  <p className="text-sm mt-1">Создайте первую скидку</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ PROMOCODES ============ */}
        {activeTab === 'promocodes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-themed-secondary text-sm">
                Промокоды вводятся вручную при оплате
              </p>
              <button
                onClick={() => openPromoModal()}
                className="h-10 px-4 bg-ios-orange text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-orange/90 transition-all ios-press"
              >
                <Plus size={18} />
                Создать
              </button>
            </div>

            <div className="grid gap-4">
              {promocodes.map(promo => (
                <div
                  key={promo.id}
                  className={`
                    ios-card rounded-ios-xl p-4 transition-all
                    ${promo.isActive ? '' : 'opacity-60'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-ios-purple/20 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                      <Ticket size={24} className="text-ios-purple" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <code className="px-2 py-1 bg-fill-tertiary rounded-ios font-mono font-bold text-ios-purple">
                          {promo.code}
                        </code>
                        <span className={`
                          px-2 py-0.5 rounded-ios-full text-xs font-bold
                          ${promo.isActive ? 'bg-ios-green/20 text-ios-green' : 'bg-fill-tertiary text-themed-secondary'}
                        `}>
                          {promo.isActive ? 'Активен' : 'Отключен'}
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-1 text-themed-primary">{promo.name}</h3>
                      <p className="text-sm text-themed-secondary mb-2">{promo.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-ios-orange font-bold">
                          {promo.type === DISCOUNT_TYPES.PERCENT ? `-${promo.value}%` : `-${formatPrice(promo.value)}`}
                        </span>
                        {promo.maxUses && (
                          <span className="text-themed-secondary">
                            Использовано: {promo.usedCount}/{promo.maxUses}
                          </span>
                        )}
                        {promo.validTo && (
                          <span className="text-themed-secondary">
                            До: {promo.validTo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(promo.code)
                        }}
                        className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-themed-primary transition-colors ios-press"
                        title="Копировать"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Удалить промокод?',
                            message: `Промокод "${promo.code}" будет удалён`,
                            confirmText: 'Удалить',
                            type: 'danger'
                          })
                          if (confirmed) deletePromocode(promo.id)
                        }}
                        className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-red transition-colors ios-press"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {promocodes.length === 0 && (
                <div className="text-center py-12 text-themed-tertiary">
                  <Ticket size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет промокодов</p>
                  <p className="text-sm mt-1">Создайте первый промокод</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============ DISCOUNT MODAL ============ */}
      {showModal === 'discount' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative ios-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 ios-glass-thick p-4 border-b border-separator flex items-center justify-between z-10">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingItem ? 'Редактировать скидку' : 'Новая скидка'}
              </h3>
              <button onClick={() => setShowModal(null)} className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary ios-press">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Название</label>
                <input
                  type="text"
                  value={discountForm.name}
                  onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="Скидка 10%"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Описание</label>
                <input
                  type="text"
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="При заказе от 500₸"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Тип скидки</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                    className="w-full h-12 px-4 ios-input appearance-none"
                  >
                    <option value={DISCOUNT_TYPES.PERCENT}>Процент</option>
                    <option value={DISCOUNT_TYPES.FIXED}>Фиксированная</option>
                    <option value={DISCOUNT_TYPES.BUY_X_GET_Y}>X+Y бесплатно</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Значение</label>
                  {discountForm.type === DISCOUNT_TYPES.BUY_X_GET_Y ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={discountForm.value?.buyX || 3}
                        onChange={(e) => setDiscountForm({ 
                          ...discountForm, 
                          value: { ...discountForm.value, buyX: parseInt(e.target.value) || 3 }
                        })}
                        className="w-full h-12 px-4 ios-input"
                        placeholder="Купи"
                      />
                      <input
                        type="number"
                        value={discountForm.value?.getY || 1}
                        onChange={(e) => setDiscountForm({ 
                          ...discountForm, 
                          value: { ...discountForm.value, getY: parseInt(e.target.value) || 1 }
                        })}
                        className="w-full h-12 px-4 ios-input"
                        placeholder="Получи"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={discountForm.value}
                      onChange={(e) => setDiscountForm({ ...discountForm, value: parseInt(e.target.value) || 0 })}
                      className="w-full h-12 px-4 ios-input"
                      placeholder={discountForm.type === DISCOUNT_TYPES.PERCENT ? '10' : '100'}
                    />
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Условия</label>
                <div className="space-y-2">
                  {discountForm.conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 ios-card-grouped rounded-ios-lg">
                      <span className="text-sm flex-1 text-themed-primary">
                        {cond.type === CONDITION_TYPES.MIN_AMOUNT && (
                          <div className="flex items-center gap-2">
                            <span>Сумма от</span>
                            <input
                              type="number"
                              value={cond.value}
                              onChange={(e) => updateCondition(idx, parseInt(e.target.value) || 0)}
                              className="w-24 h-8 px-2 ios-input text-center"
                            />
                            <span>{currencySymbol}</span>
                          </div>
                        )}
                        {cond.type === CONDITION_TYPES.TIME_RANGE && (
                          <div className="flex items-center gap-2">
                            <span>Время:</span>
                            <input
                              type="time"
                              value={cond.value?.from || cond.from}
                              onChange={(e) => updateCondition(idx, { ...cond.value, from: e.target.value })}
                              className="h-8 px-2 ios-input"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={cond.value?.to || cond.to}
                              onChange={(e) => updateCondition(idx, { ...cond.value, to: e.target.value })}
                              className="h-8 px-2 ios-input"
                            />
                          </div>
                        )}
                        {cond.type === CONDITION_TYPES.CATEGORY && (
                          <div className="flex items-center gap-2">
                            <span>Категория:</span>
                            <select
                              value={cond.value}
                              onChange={(e) => updateCondition(idx, e.target.value)}
                              className="h-8 px-2 ios-input"
                            >
                              {categories.filter(c => c !== 'Все').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </span>
                      <button
                        onClick={() => removeCondition(idx)}
                        className="p-1 text-themed-secondary hover:text-ios-red ios-press"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addCondition(CONDITION_TYPES.MIN_AMOUNT)}
                      className="px-3 py-1.5 bg-fill-tertiary rounded-ios text-xs hover:bg-fill-secondary flex items-center gap-1 text-themed-primary ios-press"
                    >
                      <Plus size={14} /> Мин. сумма
                    </button>
                    <button
                      type="button"
                      onClick={() => addCondition(CONDITION_TYPES.TIME_RANGE)}
                      className="px-3 py-1.5 bg-fill-tertiary rounded-ios text-xs hover:bg-fill-secondary flex items-center gap-1 text-themed-primary ios-press"
                    >
                      <Clock size={14} /> Время
                    </button>
                    <button
                      type="button"
                      onClick={() => addCondition(CONDITION_TYPES.CATEGORY)}
                      className="px-3 py-1.5 bg-fill-tertiary rounded-ios text-xs hover:bg-fill-secondary flex items-center gap-1 text-themed-primary ios-press"
                    >
                      <Tag size={14} /> Категория
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountForm.isActive}
                    onChange={(e) => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                    className="w-5 h-5 rounded bg-fill-tertiary border-separator text-ios-orange"
                  />
                  <span className="text-themed-primary">Активна</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discountForm.stackable}
                    onChange={(e) => setDiscountForm({ ...discountForm, stackable: e.target.checked })}
                    className="w-5 h-5 rounded bg-fill-tertiary border-separator text-ios-orange"
                  />
                  <span className="text-themed-primary">Суммируется с другими</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 ios-glass-thick p-4 border-t border-separator">
              <button
                onClick={saveDiscount}
                disabled={!discountForm.name}
                className="w-full h-12 bg-ios-orange text-white rounded-ios-lg font-semibold disabled:opacity-50 hover:bg-ios-orange/90 transition-all flex items-center justify-center gap-2 ios-press"
              >
                <Save size={20} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ PROMO MODAL ============ */}
      {showModal === 'promo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative ios-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 ios-glass-thick p-4 border-b border-separator flex items-center justify-between z-10">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">Новый промокод</h3>
              <button onClick={() => setShowModal(null)} className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary ios-press">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Код</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  className="w-full h-12 px-4 ios-input font-mono uppercase"
                  placeholder="SALE2024"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Название</label>
                <input
                  type="text"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="Летняя распродажа"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Тип</label>
                  <select
                    value={promoForm.type}
                    onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                    className="w-full h-12 px-4 ios-input appearance-none"
                  >
                    <option value={DISCOUNT_TYPES.PERCENT}>Процент</option>
                    <option value={DISCOUNT_TYPES.FIXED}>Фиксированная</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Значение</label>
                  <input
                    type="number"
                    value={promoForm.value}
                    onChange={(e) => setPromoForm({ ...promoForm, value: parseInt(e.target.value) || 0 })}
                    className="w-full h-12 px-4 ios-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Макс. использований</label>
                  <input
                    type="number"
                    value={promoForm.maxUses}
                    onChange={(e) => setPromoForm({ ...promoForm, maxUses: parseInt(e.target.value) || null })}
                    className="w-full h-12 px-4 ios-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Мин. сумма</label>
                  <input
                    type="number"
                    value={promoForm.minAmount}
                    onChange={(e) => setPromoForm({ ...promoForm, minAmount: parseInt(e.target.value) || 0 })}
                    className="w-full h-12 px-4 ios-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Действует до</label>
                <input
                  type="date"
                  value={promoForm.validTo}
                  onChange={(e) => setPromoForm({ ...promoForm, validTo: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                />
              </div>
            </div>

            <div className="sticky bottom-0 ios-glass-thick p-4 border-t border-separator">
              <button
                onClick={savePromocode}
                disabled={!promoForm.code || !promoForm.name}
                className="w-full h-12 bg-ios-purple text-white rounded-ios-lg font-semibold disabled:opacity-50 hover:bg-ios-purple/90 transition-all flex items-center justify-center gap-2 ios-press"
              >
                <Save size={20} />
                Создать промокод
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
