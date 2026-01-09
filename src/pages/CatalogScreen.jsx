import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useCatalogStore } from '../store/catalogStore'
import { 
  Package, Layers, Gift, Settings2, Tags, Plus, Edit2, Trash2, 
  X, Save, Check, ChevronRight, ToggleLeft, ToggleRight, Search,
  Clock, Percent, DollarSign, Image, AlertTriangle, Star, Eye, EyeOff,
  Copy, MoreVertical, GripVertical, Info, Sparkles
} from 'lucide-react'
import { HelpButton } from '../components/HelpSystem'
import { useConfirm, useInputDialog } from '../components/ConfirmDialog'

export default function CatalogScreen() {
  const [activeTab, setActiveTab] = useState('combos')
  const [showModal, setShowModal] = useState(null) // null, 'combo', 'set', 'modifier', 'category'
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { products, getCurrencySymbol } = useStore()
  const {
    combos, sets, modifierGroups, categories,
    addCombo, updateCombo, deleteCombo, toggleCombo,
    addSet, updateSet, deleteSet,
    addModifierGroup, updateModifierGroup, deleteModifierGroup,
    addModifier, deleteModifier,
    addCategory, deleteCategory,
    getActiveCombos, getActiveSets
  } = useCatalogStore()

  const currencySymbol = getCurrencySymbol()
  const formatPrice = (price) => `${price?.toLocaleString() || 0} ${currencySymbol}`
  const confirm = useConfirm()
  const inputDialog = useInputDialog()

  // ============ COMBO FORM ============
  const [comboForm, setComboForm] = useState({
    name: '', description: '', icon: '🎁', productIds: [],
    discount: 10, discountType: 'percent', isActive: true,
    validFrom: '', validTo: ''
  })

  const openComboModal = (combo = null) => {
    if (combo) {
      setComboForm({ ...combo })
      setEditingItem(combo.id)
    } else {
      setComboForm({
        name: '', description: '', icon: '🎁', productIds: [],
        discount: 10, discountType: 'percent', isActive: true,
        validFrom: '', validTo: ''
      })
      setEditingItem(null)
    }
    setShowModal('combo')
  }

  const saveCombo = () => {
    if (!comboForm.name || comboForm.productIds.length < 2) return
    
    if (editingItem) {
      updateCombo(editingItem, comboForm)
    } else {
      addCombo(comboForm)
    }
    setShowModal(null)
  }

  // ============ SET FORM ============
  const [setForm, setSetForm] = useState({
    name: '', description: '', icon: '🍱', fixedPrice: 0,
    products: [], isActive: true, availableFrom: '', availableTo: ''
  })

  const openSetModal = (set = null) => {
    if (set) {
      setSetForm({ ...set })
      setEditingItem(set.id)
    } else {
      setSetForm({
        name: '', description: '', icon: '🍱', fixedPrice: 0,
        products: [], isActive: true, availableFrom: '', availableTo: ''
      })
      setEditingItem(null)
    }
    setShowModal('set')
  }

  const saveSet = () => {
    if (!setForm.name || setForm.products.length === 0) return
    
    if (editingItem) {
      updateSet(editingItem, setForm)
    } else {
      addSet(setForm)
    }
    setShowModal(null)
  }

  // ============ MODIFIER FORM ============
  const [modifierForm, setModifierForm] = useState({
    name: '', type: 'single', required: false, modifiers: []
  })

  const openModifierModal = (group = null) => {
    if (group) {
      setModifierForm({ ...group })
      setEditingItem(group.id)
    } else {
      setModifierForm({
        name: '', type: 'single', required: false, modifiers: []
      })
      setEditingItem(null)
    }
    setShowModal('modifier')
  }

  const saveModifierGroup = () => {
    if (!modifierForm.name) return
    
    if (editingItem) {
      updateModifierGroup(editingItem, modifierForm)
    } else {
      addModifierGroup(modifierForm)
    }
    setShowModal(null)
  }

  // ============ TABS ============
  const tabs = [
    { id: 'combos', label: 'Комбо', icon: Gift, count: combos.length },
    { id: 'sets', label: 'Сеты', icon: Package, count: sets.length },
    { id: 'modifiers', label: 'Модификаторы', icon: Settings2, count: modifierGroups.length },
    { id: 'categories', label: 'Категории', icon: Layers, count: categories.length },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-themed-primary">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-themed">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ios-blue/20 rounded-ios-lg flex items-center justify-center">
              <Sparkles size={20} className="text-ios-blue" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-themed-primary">Каталог</h1>
              <p className="text-sm text-themed-secondary">Управление комбо, сетами и модификаторами</p>
            </div>
          </div>
          <HelpButton module="products" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-ios-lg font-semibold transition-all whitespace-nowrap ios-press
                ${activeTab === tab.id
                  ? 'bg-ios-blue text-white shadow-ios'
                  : 'bg-themed-secondary text-themed-primary border border-themed hover:bg-fill-tertiary'
                }
              `}
            >
              <tab.icon size={18} />
              {tab.label}
              <span className={`
                px-2 py-0.5 rounded-ios-full text-xs font-bold
                ${activeTab === tab.id ? 'bg-white/25' : 'bg-fill-tertiary text-themed-secondary'}
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ============ COMBOS ============ */}
        {activeTab === 'combos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-themed-secondary text-sm">
                Комбо-предложения со скидкой при покупке нескольких товаров
              </p>
              <button
                onClick={() => openComboModal()}
                className="h-10 px-4 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-blue/90 transition-all ios-press"
              >
                <Plus size={18} />
                Создать комбо
              </button>
            </div>

            <div className="grid gap-4">
              {combos.map(combo => {
                const comboProducts = combo.productIds
                  .map(id => products.find(p => p.id === id))
                  .filter(Boolean)
                const totalPrice = comboProducts.reduce((sum, p) => sum + p.price, 0)
                const discountedPrice = combo.discountType === 'percent'
                  ? Math.round(totalPrice * (1 - combo.discount / 100))
                  : totalPrice - combo.discount

                return (
                  <div
                    key={combo.id}
                    className={`
                      ios-card rounded-ios-xl p-4 transition-all
                      ${combo.isActive ? '' : 'opacity-60'}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 bg-ios-orange/20 rounded-ios-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {combo.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-themed-primary">{combo.name}</h3>
                          <span className={`
                            px-2 py-0.5 rounded-ios-full text-xs font-bold
                            ${combo.isActive ? 'bg-ios-green/20 text-ios-green' : 'bg-fill-tertiary text-themed-secondary'}
                          `}>
                            {combo.isActive ? 'Активно' : 'Отключено'}
                          </span>
                          {combo.discountType === 'percent' ? (
                            <span className="px-2 py-0.5 bg-ios-orange/20 rounded-ios-full text-xs font-bold text-ios-orange">
                              -{combo.discount}%
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-ios-orange/20 rounded-ios-full text-xs font-bold text-ios-orange">
                              -{formatPrice(combo.discount)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-themed-secondary mb-2">{combo.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {comboProducts.map(p => (
                            <span key={p.id} className="px-2 py-1 bg-fill-tertiary rounded-ios text-xs text-themed-primary">
                              {p.name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-themed-tertiary line-through mr-2">{formatPrice(totalPrice)}</span>
                            <span className="text-ios-blue font-bold">{formatPrice(discountedPrice)}</span>
                          </div>
                          {combo.validFrom && (
                            <div className="flex items-center gap-1 text-themed-secondary">
                              <Clock size={14} />
                              {combo.validFrom} - {combo.validTo}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleCombo(combo.id)}
                          className="p-2 rounded-ios hover:bg-fill-tertiary transition-colors ios-press"
                          title={combo.isActive ? 'Отключить' : 'Включить'}
                        >
                          {combo.isActive ? (
                            <ToggleRight size={24} className="text-ios-blue" />
                          ) : (
                            <ToggleLeft size={24} className="text-themed-tertiary" />
                          )}
                        </button>
                        <button
                          onClick={() => openComboModal(combo)}
                          className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-themed-primary transition-colors ios-press"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Удалить комбо?',
                              message: `Комбо "${combo.name}" будет удалено`,
                              confirmText: 'Удалить',
                              type: 'danger'
                            })
                            if (confirmed) deleteCombo(combo.id)
                          }}
                          className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-red transition-colors ios-press"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {combos.length === 0 && (
                <div className="text-center py-12 text-themed-tertiary">
                  <Gift size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет комбо-предложений</p>
                  <p className="text-sm mt-1">Создайте первое комбо</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ SETS ============ */}
        {activeTab === 'sets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-themed-secondary text-sm">
                Наборы с фиксированной ценой
              </p>
              <button
                onClick={() => openSetModal()}
                className="h-10 px-4 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-blue/90 transition-all ios-press"
              >
                <Plus size={18} />
                Создать сет
              </button>
            </div>

            <div className="grid gap-4">
              {sets.map(set => {
                const setProducts = set.products
                  .map(sp => ({
                    ...products.find(p => p.id === sp.productId),
                    quantity: sp.quantity
                  }))
                  .filter(p => p.id)
                const regularPrice = setProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
                const savings = regularPrice - set.fixedPrice

                return (
                  <div
                    key={set.id}
                    className={`
                      ios-card rounded-ios-xl p-4 transition-all
                      ${set.isActive ? '' : 'opacity-60'}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-ios-purple/20 rounded-ios-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {set.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-themed-primary">{set.name}</h3>
                          <span className={`
                            px-2 py-0.5 rounded-ios-full text-xs font-bold
                            ${set.isActive ? 'bg-ios-green/20 text-ios-green' : 'bg-fill-tertiary text-themed-secondary'}
                          `}>
                            {set.isActive ? 'Активно' : 'Отключено'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-themed-secondary mb-2">{set.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {setProducts.map(p => (
                            <span key={p.id} className="px-2 py-1 bg-fill-tertiary rounded-ios text-xs text-themed-primary">
                              {p.name} {p.quantity !== 1 && `×${p.quantity}`}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-themed-tertiary line-through mr-2">{formatPrice(regularPrice)}</span>
                            <span className="text-ios-purple font-bold text-lg">{formatPrice(set.fixedPrice)}</span>
                          </div>
                          {savings > 0 && (
                            <span className="text-ios-green text-xs">
                              Экономия {formatPrice(savings)}
                            </span>
                          )}
                          {set.availableFrom && (
                            <div className="flex items-center gap-1 text-themed-secondary">
                              <Clock size={14} />
                              {set.availableFrom} - {set.availableTo}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openSetModal(set)}
                          className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-themed-primary transition-colors ios-press"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Удалить сет?',
                              message: `Сет "${set.name}" будет удалён`,
                              confirmText: 'Удалить',
                              type: 'danger'
                            })
                            if (confirmed) deleteSet(set.id)
                          }}
                          className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-red transition-colors ios-press"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {sets.length === 0 && (
                <div className="text-center py-12 text-themed-tertiary">
                  <Package size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет сетов</p>
                  <p className="text-sm mt-1">Создайте первый набор</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ MODIFIERS ============ */}
        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-themed-secondary text-sm">
                Добавки и опции для товаров (размер, соус, температура)
              </p>
              <button
                onClick={() => openModifierModal()}
                className="h-10 px-4 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-blue/90 transition-all ios-press"
              >
                <Plus size={18} />
                Создать группу
              </button>
            </div>

            <div className="grid gap-4">
              {modifierGroups.map(group => (
                <div key={group.id} className="ios-card rounded-ios-xl overflow-hidden">
                  <div className="p-4 border-b border-separator">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-themed-primary">{group.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`
                            px-2 py-0.5 rounded-ios-full text-xs
                            ${group.type === 'single' ? 'bg-ios-blue/20 text-ios-blue' : 'bg-ios-purple/20 text-ios-purple'}
                          `}>
                            {group.type === 'single' ? 'Один выбор' : 'Множественный'}
                          </span>
                          {group.required && (
                            <span className="px-2 py-0.5 bg-ios-red/20 text-ios-red rounded-ios-full text-xs">
                              Обязательно
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModifierModal(group)}
                          className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-themed-primary transition-colors ios-press"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Удалить группу?',
                              message: `Группа модификаторов "${group.name}" будет удалена`,
                              confirmText: 'Удалить',
                              type: 'danger'
                            })
                            if (confirmed) deleteModifierGroup(group.id)
                          }}
                          className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-red transition-colors ios-press"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {group.modifiers.map(mod => (
                        <div
                          key={mod.id}
                          className="flex items-center gap-2 px-3 py-2 bg-fill-tertiary rounded-ios text-themed-primary"
                        >
                          <span>{mod.name}</span>
                          {mod.price > 0 && (
                            <span className="text-ios-blue text-sm">+{formatPrice(mod.price)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {modifierGroups.length === 0 && (
                <div className="text-center py-12 text-themed-tertiary">
                  <Settings2 size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет групп модификаторов</p>
                  <p className="text-sm mt-1">Создайте первую группу</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ CATEGORIES ============ */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-themed-secondary text-sm">
                Иерархические категории товаров
              </p>
              <button
                onClick={async () => {
                  const name = await inputDialog({ 
                    title: 'Новая категория', 
                    message: 'Введите название категории',
                    placeholder: 'Название категории'
                  })
                  if (!name) return
                  const icon = await inputDialog({ 
                    title: 'Иконка категории', 
                    message: 'Введите emoji для иконки',
                    placeholder: '📦',
                    defaultValue: '📦'
                  })
                  addCategory({ name, icon: icon || '📦', color: '#3b82f6' })
                }}
                className="h-10 px-4 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-blue/90 transition-all ios-press"
              >
                <Plus size={18} />
                Добавить категорию
              </button>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="ios-card rounded-ios-xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-ios-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-themed-primary">{cat.name}</h3>
                        <p className="text-xs text-themed-secondary">
                          {cat.subcategories?.length || 0} подкатегорий
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const name = await inputDialog({ 
                            title: 'Новая подкатегория', 
                            message: `Добавить в "${cat.name}"`,
                            placeholder: 'Название подкатегории'
                          })
                          if (!name) return
                          const icon = await inputDialog({ 
                            title: 'Иконка подкатегории', 
                            message: 'Введите emoji для иконки',
                            placeholder: '📦',
                            defaultValue: '📦'
                          })
                          addCategory({ name, icon: icon || '📦' }, cat.id)
                        }}
                        className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-blue transition-colors ios-press"
                        title="Добавить подкатегорию"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Удалить категорию?',
                            message: `Категория "${cat.name}" и все подкатегории будут удалены`,
                            confirmText: 'Удалить',
                            type: 'danger'
                          })
                          if (confirmed) deleteCategory(cat.id)
                        }}
                        className="p-2 rounded-ios hover:bg-fill-tertiary text-themed-secondary hover:text-ios-red transition-colors ios-press"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories.map(sub => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 px-3 py-2 bg-fill-tertiary rounded-ios group"
                          >
                            <span>{sub.icon}</span>
                            <span className="text-themed-primary">{sub.name}</span>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Удалить подкатегорию?',
                                  message: `Подкатегория "${sub.name}" будет удалена`,
                                  confirmText: 'Удалить',
                                  type: 'danger'
                                })
                                if (confirmed) deleteCategory(sub.id, cat.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 text-themed-secondary hover:text-ios-red transition-all ios-press"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============ COMBO MODAL ============ */}
      {showModal === 'combo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative ios-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 ios-glass-thick p-4 border-b border-separator flex items-center justify-between z-10">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingItem ? 'Редактировать комбо' : 'Новое комбо'}
              </h3>
              <button onClick={() => setShowModal(null)} className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary ios-press">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-[auto_1fr] gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Иконка</label>
                  <input
                    type="text"
                    value={comboForm.icon}
                    onChange={(e) => setComboForm({ ...comboForm, icon: e.target.value })}
                    className="w-16 h-12 text-2xl text-center ios-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Название</label>
                  <input
                    type="text"
                    value={comboForm.name}
                    onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })}
                    className="w-full h-12 px-4 ios-input"
                    placeholder="Перекус"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Описание</label>
                <input
                  type="text"
                  value={comboForm.description}
                  onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="Идеально для быстрого перекуса"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Товары в комбо</label>
                <div className="bg-fill-tertiary rounded-ios-lg p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {products.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const ids = comboForm.productIds.includes(p.id)
                            ? comboForm.productIds.filter(id => id !== p.id)
                            : [...comboForm.productIds, p.id]
                          setComboForm({ ...comboForm, productIds: ids })
                        }}
                        className={`
                          p-2 rounded-ios text-left text-sm transition-all ios-press
                          ${comboForm.productIds.includes(p.id)
                            ? 'bg-ios-blue/20 border-ios-blue border text-themed-primary'
                            : 'bg-themed-secondary border border-transparent hover:border-separator text-themed-primary'
                          }
                        `}
                      >
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-themed-secondary">{formatPrice(p.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Скидка</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={comboForm.discount}
                      onChange={(e) => setComboForm({ ...comboForm, discount: parseInt(e.target.value) || 0 })}
                      className="flex-1 h-12 px-4 ios-input"
                    />
                    <select
                      value={comboForm.discountType}
                      onChange={(e) => setComboForm({ ...comboForm, discountType: e.target.value })}
                      className="h-12 px-3 ios-input appearance-none"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">{currencySymbol}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Время действия</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={comboForm.validFrom}
                      onChange={(e) => setComboForm({ ...comboForm, validFrom: e.target.value })}
                      className="flex-1 h-12 px-3 ios-input"
                    />
                    <input
                      type="time"
                      value={comboForm.validTo}
                      onChange={(e) => setComboForm({ ...comboForm, validTo: e.target.value })}
                      className="flex-1 h-12 px-3 ios-input"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comboForm.isActive}
                  onChange={(e) => setComboForm({ ...comboForm, isActive: e.target.checked })}
                  className="w-5 h-5 rounded bg-fill-tertiary border-separator text-ios-blue focus:ring-ios-blue"
                />
                <span className="text-themed-primary">Активно</span>
              </label>
            </div>

            <div className="sticky bottom-0 ios-glass-thick p-4 border-t border-separator">
              <button
                onClick={saveCombo}
                disabled={!comboForm.name || comboForm.productIds.length < 2}
                className="w-full h-12 bg-ios-blue text-white rounded-ios-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ios-blue/90 transition-all flex items-center justify-center gap-2 ios-press"
              >
                <Save size={20} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SET MODAL ============ */}
      {showModal === 'set' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative ios-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 ios-glass-thick p-4 border-b border-separator flex items-center justify-between z-10">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingItem ? 'Редактировать сет' : 'Новый сет'}
              </h3>
              <button onClick={() => setShowModal(null)} className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary ios-press">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-[auto_1fr] gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Иконка</label>
                  <input
                    type="text"
                    value={setForm.icon}
                    onChange={(e) => setSetForm({ ...setForm, icon: e.target.value })}
                    className="w-16 h-12 text-2xl text-center ios-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Название</label>
                  <input
                    type="text"
                    value={setForm.name}
                    onChange={(e) => setSetForm({ ...setForm, name: e.target.value })}
                    className="w-full h-12 px-4 ios-input"
                    placeholder="Бизнес-ланч"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Описание</label>
                <input
                  type="text"
                  value={setForm.description}
                  onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="Полноценный обед"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Товары в сете</label>
                <div className="bg-fill-tertiary rounded-ios-lg p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {products.map(p => {
                      const inSet = setForm.products.find(sp => sp.productId === p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (inSet) {
                              setSetForm({ 
                                ...setForm, 
                                products: setForm.products.filter(sp => sp.productId !== p.id) 
                              })
                            } else {
                              setSetForm({ 
                                ...setForm, 
                                products: [...setForm.products, { productId: p.id, quantity: 1 }] 
                              })
                            }
                          }}
                          className={`
                            p-2 rounded-ios text-left text-sm transition-all ios-press
                            ${inSet
                              ? 'bg-ios-purple/20 border-ios-purple border text-themed-primary'
                              : 'bg-themed-secondary border border-transparent hover:border-separator text-themed-primary'
                            }
                          `}
                        >
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-themed-secondary">{formatPrice(p.price)}</div>
                          {inSet && (
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (inSet.quantity > 0.5) {
                                    setSetForm({
                                      ...setForm,
                                      products: setForm.products.map(sp =>
                                        sp.productId === p.id ? { ...sp, quantity: sp.quantity - 0.5 } : sp
                                      )
                                    })
                                  }
                                }}
                                className="w-6 h-6 bg-ios-purple/30 rounded-full flex items-center justify-center text-ios-purple"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-medium text-ios-purple">{inSet.quantity}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSetForm({
                                    ...setForm,
                                    products: setForm.products.map(sp =>
                                      sp.productId === p.id ? { ...sp, quantity: sp.quantity + 0.5 } : sp
                                    )
                                  })
                                }}
                                className="w-6 h-6 bg-ios-purple/30 rounded-full flex items-center justify-center text-ios-purple"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Фиксированная цена</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={setForm.fixedPrice}
                      onChange={(e) => setSetForm({ ...setForm, fixedPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full h-12 px-4 ios-input"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-themed-secondary">{currencySymbol}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Время действия</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={setForm.availableFrom}
                      onChange={(e) => setSetForm({ ...setForm, availableFrom: e.target.value })}
                      className="flex-1 h-12 px-3 ios-input"
                    />
                    <input
                      type="time"
                      value={setForm.availableTo}
                      onChange={(e) => setSetForm({ ...setForm, availableTo: e.target.value })}
                      className="flex-1 h-12 px-3 ios-input"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={setForm.isActive}
                  onChange={(e) => setSetForm({ ...setForm, isActive: e.target.checked })}
                  className="w-5 h-5 rounded bg-fill-tertiary border-separator text-ios-purple focus:ring-ios-purple"
                />
                <span className="text-themed-primary">Активно</span>
              </label>
            </div>

            <div className="sticky bottom-0 ios-glass-thick p-4 border-t border-separator">
              <button
                onClick={saveSet}
                disabled={!setForm.name || setForm.products.length === 0}
                className="w-full h-12 bg-ios-purple text-white rounded-ios-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ios-purple/90 transition-all flex items-center justify-center gap-2 ios-press"
              >
                <Save size={20} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODIFIER MODAL ============ */}
      {showModal === 'modifier' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative ios-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 ios-glass-thick p-4 border-b border-separator flex items-center justify-between z-10">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingItem ? 'Редактировать группу' : 'Новая группа модификаторов'}
              </h3>
              <button onClick={() => setShowModal(null)} className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary ios-press">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Название группы</label>
                <input
                  type="text"
                  value={modifierForm.name}
                  onChange={(e) => setModifierForm({ ...modifierForm, name: e.target.value })}
                  className="w-full h-12 px-4 ios-input"
                  placeholder="Размер напитка"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Тип выбора</label>
                  <select
                    value={modifierForm.type}
                    onChange={(e) => setModifierForm({ ...modifierForm, type: e.target.value })}
                    className="w-full h-12 px-4 ios-input appearance-none"
                  >
                    <option value="single">Один выбор</option>
                    <option value="multiple">Несколько</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer h-12">
                    <input
                      type="checkbox"
                      checked={modifierForm.required}
                      onChange={(e) => setModifierForm({ ...modifierForm, required: e.target.checked })}
                      className="w-5 h-5 rounded bg-fill-tertiary border-separator text-ios-blue"
                    />
                    <span className="text-themed-primary">Обязательный выбор</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Модификаторы</label>
                <div className="space-y-2">
                  {modifierForm.modifiers.map((mod, idx) => (
                    <div key={mod.id || idx} className="flex gap-2">
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => {
                          const updated = [...modifierForm.modifiers]
                          updated[idx] = { ...mod, name: e.target.value }
                          setModifierForm({ ...modifierForm, modifiers: updated })
                        }}
                        className="flex-1 h-10 px-3 ios-input"
                        placeholder="Название"
                      />
                      <input
                        type="number"
                        value={mod.price}
                        onChange={(e) => {
                          const updated = [...modifierForm.modifiers]
                          updated[idx] = { ...mod, price: parseInt(e.target.value) || 0 }
                          setModifierForm({ ...modifierForm, modifiers: updated })
                        }}
                        className="w-24 h-10 px-3 ios-input"
                        placeholder="Цена"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setModifierForm({
                            ...modifierForm,
                            modifiers: modifierForm.modifiers.filter((_, i) => i !== idx)
                          })
                        }}
                        className="w-10 h-10 text-themed-secondary hover:text-ios-red hover:bg-ios-red/10 rounded-ios flex items-center justify-center ios-press"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setModifierForm({
                        ...modifierForm,
                        modifiers: [...modifierForm.modifiers, { id: Date.now(), name: '', price: 0 }]
                      })
                    }}
                    className="w-full h-10 border border-dashed border-separator rounded-ios text-themed-secondary hover:text-themed-primary hover:border-label-secondary flex items-center justify-center gap-2 ios-press"
                  >
                    <Plus size={18} />
                    Добавить модификатор
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 ios-glass-thick p-4 border-t border-separator">
              <button
                onClick={saveModifierGroup}
                disabled={!modifierForm.name}
                className="w-full h-12 bg-ios-blue text-white rounded-ios-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ios-blue/90 transition-all flex items-center justify-center gap-2 ios-press"
              >
                <Save size={20} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
