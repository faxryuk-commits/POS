import { useState } from 'react'
import { useStore } from '../store/useStore'
import { 
  Settings, Store, CreditCard, Users, LogOut, Save, 
  ChevronRight, Globe, Printer, Database, Shield,
  Plus, Edit2, Trash2, X, Check, GraduationCap, Sun, Moon, Monitor,
  MapPin, Phone, Star
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeProvider'
import { useConfirm, useStatusToast } from '../components/ConfirmDialog'

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('general')
  const [showCashierModal, setShowCashierModal] = useState(false)
  const [editingCashier, setEditingCashier] = useState(null)
  const [cashierForm, setCashierForm] = useState({ name: '', pin: '', role: 'cashier' })
  const [showStoreModal, setShowStoreModal] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [storeForm, setStoreForm] = useState({ name: '', address: '', phone: '' })

  const {
    settings,
    updateSettings,
    currencies,
    currentCashier,
    cashiers,
    addCashier,
    updateCashier,
    deleteCashier,
    logout,
    resetToDemo,
    setShowOnboarding,
    // Stores
    stores,
    currentStore,
    addStore,
    updateStore,
    deleteStore,
    setCurrentStore,
    setDefaultStore
  } = useStore()
  const confirm = useConfirm()
  const { success } = useStatusToast()

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value })
  }

  const openCashierModal = (cashier = null) => {
    if (cashier) {
      setEditingCashier(cashier)
      setCashierForm({ name: cashier.name, pin: cashier.pin, role: cashier.role })
    } else {
      setEditingCashier(null)
      setCashierForm({ name: '', pin: '', role: 'cashier' })
    }
    setShowCashierModal(true)
  }

  const handleCashierSubmit = (e) => {
    e.preventDefault()
    if (editingCashier) {
      updateCashier(editingCashier.id, cashierForm)
    } else {
      addCashier(cashierForm)
    }
    setShowCashierModal(false)
  }

  const handleDeleteCashier = async (cashier) => {
    const confirmed = await confirm({
      title: 'Удалить кассира?',
      message: `Кассир "${cashier.name}" будет удалён`,
      confirmText: 'Удалить',
      type: 'danger'
    })
    if (confirmed) {
      deleteCashier(cashier.id)
    }
  }

  // Store modal handlers
  const openStoreModal = (store = null) => {
    if (store) {
      setEditingStore(store)
      setStoreForm({ name: store.name, address: store.address || '', phone: store.phone || '' })
    } else {
      setEditingStore(null)
      setStoreForm({ name: '', address: '', phone: '' })
    }
    setShowStoreModal(true)
  }

  const handleStoreSubmit = (e) => {
    e.preventDefault()
    if (!storeForm.name.trim()) return

    if (editingStore) {
      updateStore(editingStore.id, storeForm)
      success('Точка обновлена')
    } else {
      addStore(storeForm)
      success('Точка добавлена')
    }
    setShowStoreModal(false)
  }

  const handleDeleteStore = async (store) => {
    if (stores.length <= 1) {
      alert('Нельзя удалить единственную точку')
      return
    }
    const confirmed = await confirm({
      title: 'Удалить точку?',
      message: `Точка "${store.name}" будет удалена`,
      confirmText: 'Удалить',
      type: 'danger'
    })
    if (confirmed) {
      deleteStore(store.id)
      success('Точка удалена')
    }
  }

  const tabs = [
    { id: 'general', icon: Store, label: 'Основные' },
    { id: 'stores', icon: MapPin, label: 'Точки' },
    { id: 'currency', icon: Globe, label: 'Валюта' },
    { id: 'cashiers', icon: Users, label: 'Кассиры' },
    { id: 'receipt', icon: Printer, label: 'Чеки' },
    { id: 'data', icon: Database, label: 'Данные' },
  ]

  return (
    <div className="h-full flex flex-col md:flex-row bg-themed-primary">
      {/* Sidebar */}
      <div className="md:w-64 ios-glass-thick border-b md:border-b-0 md:border-r border-themed">
        {/* Cashier Profile */}
        <div className="p-4 border-b border-themed">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-ios-blue/20 rounded-ios-lg flex items-center justify-center">
              <Shield className="text-ios-blue" size={24} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-themed-primary">{currentCashier?.name}</div>
              <div className="text-sm text-themed-secondary">
                {currentCashier?.role === 'admin' ? 'Администратор' : 'Кассир'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-ios-lg transition-all whitespace-nowrap ios-press
                ${activeTab === id
                  ? 'bg-ios-blue text-white'
                  : 'text-themed-primary hover:bg-fill-tertiary'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-semibold">{label}</span>
              <ChevronRight size={16} className="ml-auto hidden md:block opacity-50" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="hidden md:block p-4 mt-auto border-t border-themed">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-ios-lg text-ios-red hover:bg-ios-red/10 transition-colors ios-press"
          >
            <LogOut size={20} />
            <span className="font-medium">Выйти</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-themed-primary">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-themed-primary">
              <Store className="text-ios-blue" />
              Основные настройки
            </h2>
            
            <div className="ios-card-grouped p-5 space-y-5">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Название магазина</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleSettingChange('storeName', e.target.value)}
                  className="w-full h-12 px-4 ios-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Адрес</label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                  placeholder="ул. Примерная, д. 1"
                  className="w-full h-12 px-4 ios-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Ставка НДС (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-full h-12 px-4 ios-input"
                />
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Тема оформления</label>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}

        {/* Stores */}
        {activeTab === 'stores' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-themed-primary">
                <MapPin className="text-ios-purple" />
                Точки продаж
              </h2>
              <button
                onClick={() => openStoreModal()}
                className="h-10 px-4 bg-ios-blue text-white rounded-ios font-medium flex items-center gap-2 hover:bg-ios-blue/90 transition-colors ios-press"
              >
                <Plus size={18} />
                Добавить
              </button>
            </div>
            
            <div className="space-y-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className={`ios-card-grouped p-4 rounded-ios-lg border-2 transition-all ${
                    currentStore === store.id 
                      ? 'border-ios-blue bg-ios-blue/5' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        store.isDefault ? 'bg-ios-orange/20' : 'bg-fill-tertiary'
                      }`}
                    >
                      <Store size={24} className={store.isDefault ? 'text-ios-orange' : 'text-themed-tertiary'} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-themed-primary">{store.name}</span>
                        {store.isDefault && (
                          <span className="px-2 py-0.5 bg-ios-orange/20 text-ios-orange text-xs font-medium rounded-full flex items-center gap-1">
                            <Star size={10} />
                            По умолчанию
                          </span>
                        )}
                        {currentStore === store.id && (
                          <span className="px-2 py-0.5 bg-ios-blue/20 text-ios-blue text-xs font-medium rounded-full">
                            Активная
                          </span>
                        )}
                      </div>
                      {store.address && (
                        <p className="text-sm text-themed-secondary flex items-center gap-1">
                          <MapPin size={12} />
                          {store.address}
                        </p>
                      )}
                      {store.phone && (
                        <p className="text-sm text-themed-secondary flex items-center gap-1">
                          <Phone size={12} />
                          {store.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {currentStore !== store.id && (
                        <button
                          onClick={() => setCurrentStore(store.id)}
                          className="p-2 text-ios-blue hover:bg-ios-blue/10 rounded-ios transition-colors"
                          title="Выбрать"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {!store.isDefault && (
                        <button
                          onClick={() => setDefaultStore(store.id)}
                          className="p-2 text-ios-orange hover:bg-ios-orange/10 rounded-ios transition-colors"
                          title="Сделать по умолчанию"
                        >
                          <Star size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => openStoreModal(store)}
                        className="p-2 text-themed-secondary hover:bg-fill-tertiary rounded-ios transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="p-2 text-ios-red hover:bg-ios-red/10 rounded-ios transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {stores.length === 0 && (
                <div className="text-center py-12 text-themed-tertiary">
                  <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Нет точек продаж</p>
                  <button
                    onClick={() => openStoreModal()}
                    className="mt-3 text-ios-blue hover:underline"
                  >
                    Добавить первую точку
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Currency */}
        {activeTab === 'currency' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-themed-primary">
              <Globe className="text-ios-green" />
              Выбор валюты
            </h2>
            
            <div className="grid gap-3">
              {Object.values(currencies).map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSettingChange('currency', currency.code)}
                  className={`
                    flex items-center gap-4 p-4 rounded-ios-lg border transition-all ios-press
                    ${settings.currency === currency.code
                      ? 'bg-ios-blue/20 border-ios-blue text-themed-primary'
                      : 'ios-card-grouped border-transparent text-themed-secondary hover:border-separator'
                    }
                  `}
                >
                  <span className="text-2xl">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-themed-primary">{currency.name}</div>
                    <div className="text-sm text-themed-secondary">{currency.code}</div>
                  </div>
                  <div className="text-2xl font-bold text-themed-primary">{currency.symbol}</div>
                  {settings.currency === currency.code && (
                    <Check className="text-ios-blue" size={20} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cashiers */}
        {activeTab === 'cashiers' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-themed-primary">
                <Users className="text-ios-purple" />
                Управление кассирами
              </h2>
              <button
                onClick={() => openCashierModal()}
                className="h-10 px-4 bg-ios-blue text-white rounded-ios-lg font-medium flex items-center gap-2 hover:bg-ios-blue/90 transition-colors ios-press"
              >
                <Plus size={18} />
                Добавить
              </button>
            </div>
            
            <div className="space-y-3">
              {cashiers.map((cashier) => (
                <div
                  key={cashier.id}
                  className="flex items-center gap-4 p-4 ios-card-grouped rounded-ios-lg"
                >
                  <div className={`
                    w-12 h-12 rounded-ios-lg flex items-center justify-center
                    ${cashier.role === 'admin' ? 'bg-ios-orange/20' : 'bg-fill-tertiary'}
                  `}>
                    <Users className={cashier.role === 'admin' ? 'text-ios-orange' : 'text-themed-secondary'} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-themed-primary">{cashier.name}</div>
                    <div className="text-sm text-themed-secondary">
                      PIN: <span className="font-mono">{cashier.pin}</span> • {cashier.role === 'admin' ? 'Администратор' : 'Кассир'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCashierModal(cashier)}
                      className="w-9 h-9 bg-fill-tertiary rounded-ios flex items-center justify-center text-themed-secondary hover:bg-ios-blue/20 hover:text-ios-blue transition-colors ios-press"
                    >
                      <Edit2 size={16} />
                    </button>
                    {cashier.id !== currentCashier?.id && (
                      <button
                        onClick={() => handleDeleteCashier(cashier)}
                        className="w-9 h-9 bg-fill-tertiary rounded-ios flex items-center justify-center text-themed-secondary hover:bg-ios-red/20 hover:text-ios-red transition-colors ios-press"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Receipt */}
        {activeTab === 'receipt' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-themed-primary">
              <Printer className="text-ios-teal" />
              Настройки чеков
            </h2>
            
            <div className="ios-card-grouped p-5 space-y-4">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Текст в конце чека</label>
                <textarea
                  value={settings.receiptFooter}
                  onChange={(e) => handleSettingChange('receiptFooter', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 ios-input resize-none"
                />
              </div>
              
              {/* Receipt Preview */}
              <div className="mt-6">
                <label className="block text-sm text-themed-secondary mb-2">Превью чека</label>
                <div className="bg-white text-black p-4 rounded-ios font-mono text-sm max-w-xs shadow-ios">
                  <div className="text-center font-bold mb-2">{settings.storeName}</div>
                  {settings.storeAddress && (
                    <div className="text-center text-xs mb-2">{settings.storeAddress}</div>
                  )}
                  <div className="border-t border-dashed border-gray-400 my-2" />
                  <div className="flex justify-between">
                    <span>Товар 1</span>
                    <span>100 {currencies[settings.currency]?.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Товар 2</span>
                    <span>50 {currencies[settings.currency]?.symbol}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 my-2" />
                  <div className="flex justify-between font-bold">
                    <span>ИТОГО:</span>
                    <span>150 {currencies[settings.currency]?.symbol}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 my-2" />
                  <div className="text-center text-xs">{settings.receiptFooter}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data */}
        {activeTab === 'data' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-themed-primary">
              <Database className="text-ios-indigo" />
              Управление данными
            </h2>
            
            <div className="space-y-4">
              {/* Training */}
              <div className="p-4 bg-ios-blue/10 rounded-ios-lg border border-ios-blue/30">
                <div className="font-medium text-ios-blue mb-1 flex items-center gap-2">
                  <GraduationCap size={18} />
                  Пройти обучение
                </div>
                <p className="text-sm text-themed-secondary mb-4">
                  Запустить интерактивный тур по функциям системы
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem('pos-onboarding-completed')
                    setShowOnboarding(true)
                  }}
                  className="h-10 px-4 bg-ios-blue/20 text-ios-blue rounded-ios font-medium hover:bg-ios-blue/30 transition-colors flex items-center gap-2 ios-press"
                >
                  <GraduationCap size={18} />
                  Начать обучение
                </button>
              </div>

              <div className="p-4 ios-card-grouped rounded-ios-lg">
                <div className="font-medium text-themed-primary mb-1">Сбросить демо-данные</div>
                <p className="text-sm text-themed-secondary mb-4">
                  Вернуть товары, транзакции и настройки к исходному состоянию
                </p>
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Сбросить данные?',
                      message: 'Все данные будут возвращены к демо-состоянию',
                      confirmText: 'Сбросить',
                      type: 'warning'
                    })
                    if (confirmed) resetToDemo()
                  }}
                  className="h-10 px-4 bg-ios-orange/20 text-ios-orange rounded-ios font-medium hover:bg-ios-orange/30 transition-colors ios-press"
                >
                  Сбросить данные
                </button>
              </div>
              
              <div className="p-4 bg-ios-red/10 rounded-ios-lg border border-ios-red/30">
                <div className="font-medium text-ios-red mb-1">Удалить все данные</div>
                <p className="text-sm text-themed-secondary mb-4">
                  Полностью очистить все данные приложения (необратимо)
                </p>
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Удалить все данные?',
                      message: 'Это действие нельзя отменить! Все данные будут потеряны.',
                      confirmText: 'Удалить всё',
                      type: 'danger'
                    })
                    if (confirmed) {
                      localStorage.clear()
                      window.location.reload()
                    }
                  }}
                  className="h-10 px-4 bg-ios-red/20 text-ios-red rounded-ios font-medium hover:bg-ios-red/30 transition-colors ios-press"
                >
                  Удалить всё
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cashier Modal */}
      {showCashierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCashierModal(false)}
          />
          <div className="relative ios-modal w-full max-w-md">
            <div className="p-5 border-b border-separator flex items-center justify-between">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingCashier ? 'Редактировать кассира' : 'Новый кассир'}
              </h3>
              <button
                onClick={() => setShowCashierModal(false)}
                className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary transition-colors ios-press"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCashierSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Имя</label>
                <input
                  type="text"
                  value={cashierForm.name}
                  onChange={(e) => setCashierForm({ ...cashierForm, name: e.target.value })}
                  required
                  className="w-full h-12 px-4 ios-input"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">PIN-код (4 цифры)</label>
                <input
                  type="text"
                  value={cashierForm.pin}
                  onChange={(e) => setCashierForm({ ...cashierForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  className="w-full h-12 px-4 ios-input font-mono text-center text-2xl tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Роль</label>
                <select
                  value={cashierForm.role}
                  onChange={(e) => setCashierForm({ ...cashierForm, role: e.target.value })}
                  className="w-full h-12 px-4 ios-input appearance-none"
                >
                  <option value="cashier">Кассир</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center justify-center gap-2 hover:bg-ios-blue/90 transition-all ios-press mt-6"
              >
                <Save size={20} />
                {editingCashier ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowStoreModal(false)}
          />
          <div className="relative ios-modal w-full max-w-md">
            <div className="p-5 border-b border-separator flex items-center justify-between">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingStore ? 'Редактировать точку' : 'Новая точка'}
              </h3>
              <button
                onClick={() => setShowStoreModal(false)}
                className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary transition-colors ios-press"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStoreSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-themed-secondary mb-2">Название *</label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  required
                  placeholder="Главный магазин"
                  className="w-full h-12 px-4 ios-input"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Адрес</label>
                <input
                  type="text"
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  placeholder="ул. Примерная, д. 1"
                  className="w-full h-12 px-4 ios-input"
                />
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Телефон</label>
                <input
                  type="tel"
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full h-12 px-4 ios-input"
                />
              </div>

              <button
                type="submit"
                disabled={!storeForm.name.trim()}
                className={`w-full h-12 rounded-ios-lg font-semibold flex items-center justify-center gap-2 transition-all ios-press mt-6 ${
                  storeForm.name.trim()
                    ? 'bg-ios-blue text-white hover:bg-ios-blue/90'
                    : 'bg-fill-tertiary text-themed-tertiary'
                }`}
              >
                <Save size={20} />
                {editingStore ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
