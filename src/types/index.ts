/**
 * TypeScript типы для POS System
 * Полная типизация системы
 */

import type { ReactNode } from 'react'

// ============ PRODUCTS ============

/** Категории товаров */
export type ProductCategory = 
  | 'Напитки' 
  | 'Сладости' 
  | 'Хлеб' 
  | 'Молочные' 
  | 'Фрукты' 
  | 'Снеки' 
  | 'Табак' 
  | 'Алкоголь'

/** Ограничения по времени продажи */
export interface TimeRestriction {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

/** Товар */
export interface Product {
  id: number
  name: string
  price: number
  stock: number
  category: ProductCategory | string
  barcode: string
  minStock?: number
  timeRestriction?: TimeRestriction
  icon?: string
}

/** Товар в корзине */
export interface CartItem extends Product {
  quantity: number
  variant?: ProductVariant
  modifiers?: Record<string, Modifier | Modifier[]>
  totalPrice?: number
}

/** Вариант товара */
export interface ProductVariant {
  id: string
  name: string
  priceDiff: number
}

/** Модификатор товара */
export interface Modifier {
  id: string
  name: string
  price: number
}

/** Группа модификаторов */
export interface ModifierGroup {
  id: string
  name: string
  type: 'single' | 'multiple'
  required: boolean
  modifiers: Modifier[]
}

/** Карточка товара с расширенной информацией */
export interface ProductCard {
  productId: number
  description?: string
  nutrition?: {
    calories: number
    protein: number
    fat: number
    carbs: number
  }
  allergens?: string[]
  ingredients?: string[]
  weight?: string
  manufacturer?: string
  shelfLife?: string
  sku?: string
  tags?: string[]
}

// ============ CATEGORIES ============

/** Категория каталога */
export interface Category {
  id: string
  name: string
  icon: string
  color?: string
  parentId?: string | null
  subcategories?: Category[]
}

// ============ COMBOS & SETS ============

/** Комбо-набор */
export interface Combo {
  id: string
  name: string
  description: string
  productIds: number[]
  discount: number
  icon?: string
  active?: boolean
  // Вычисляемые поля
  totalPrice?: number
  discountedPrice?: number
  originalPrice?: number
  products?: Product[]
  isPartial?: boolean
  missingProducts?: Product[]
}

/** Сет товаров */
export interface ProductSet {
  id: string
  name: string
  description: string
  productIds: number[]
  fixedPrice: number
  icon?: string
  active?: boolean
}

/** Аксессуар/Доп */
export interface Accessory {
  id: string
  name: string
  price: number
  icon: string
  productCategories: string[]
}

// ============ TRANSACTIONS ============

/** Способ оплаты */
export type PaymentMethod = 'cash' | 'card' | 'qr' | 'mixed'

/** Транзакция (продажа) */
export interface Transaction {
  id: number
  receiptNumber: string
  items: CartItem[]
  subtotal?: number
  total: number
  discount?: number
  tax?: number
  taxRate?: number
  paymentMethod: PaymentMethod
  receivedAmount?: number
  received?: number
  change: number
  cashier: string
  cashierId: number
  currency: CurrencyCode
  date: string // ISO string
  type: 'sale' | 'refund'
}

// ============ STOCK ============

/** Тип движения товара */
export type StockMovementType = 'incoming' | 'outgoing' | 'adjustment' | 'return'

/** Движение товара на складе */
export interface StockMovement {
  id: number
  productId: number
  productName: string
  type: StockMovementType
  quantity: number
  comment: string
  cashier: string
  date: string // ISO string
}

// ============ USERS ============

/** Роль пользователя */
export type UserRole = 'admin' | 'cashier' | 'manager'

/** Кассир/Пользователь */
export interface Cashier {
  id: number
  name: string
  pin: string
  role: UserRole
  active?: boolean
}

// ============ CURRENCIES ============

/** Код валюты */
export type CurrencyCode = 
  | 'RUB' | 'UZS' | 'KZT' | 'KGS' | 'TJS' 
  | 'TMT' | 'AZN' | 'GEL' | 'AMD' | 'BYN' 
  | 'UAH' | 'MDL' | 'USD' | 'EUR'

/** Валюта */
export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
  flag: string
}

/** Объект валют */
export type CurrenciesMap = Record<CurrencyCode, Currency>

// ============ DISCOUNTS ============

/** Тип скидки */
export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y'

/** Скидка */
export interface Discount {
  id: string
  name: string
  type: DiscountType
  value: number
  conditions?: DiscountCondition[]
  active: boolean
  startDate?: string
  endDate?: string
}

/** Условие скидки */
export interface DiscountCondition {
  type: 'min_amount' | 'min_items' | 'category' | 'product' | 'time'
  value: number | string
}

/** Промокод */
export interface Promocode {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  usageLimit?: number
  usageCount: number
  expiresAt?: string
  active: boolean
}

/** Информация о скидке */
export interface DiscountInfo {
  total: number
  discounts: Array<{
    name: string
    amount: number
    type: string
  }>
}

// ============ SETTINGS ============

/** Настройки магазина */
export interface Settings {
  currency: CurrencyCode
  storeName: string
  storeAddress: string
  storePhone?: string
  taxRate: number
  receiptFooter: string
  theme?: 'light' | 'dark' | 'system'
  language?: string
  soundEnabled?: boolean
  vibrationEnabled?: boolean
}

// ============ THEME ============

/** Тема приложения */
export type Theme = 'light' | 'dark' | 'system'

// ============ STORE ============

/** Страницы приложения */
export type AppPage = 'pos' | 'products' | 'catalog' | 'discounts' | 'stock' | 'reports' | 'settings'

/** Состояние Zustand store */
export interface StoreState {
  // Настройки
  settings: Settings
  currencies: CurrenciesMap
  theme: Theme

  // Авторизация
  isAuthenticated: boolean
  currentCashier: Cashier | null
  cashiers: Cashier[]
  showPinModal: boolean
  showOnboarding: boolean

  // Товары
  products: Product[]
  categories: string[]
  
  // Корзина
  cart: CartItem[]
  
  // Транзакции
  transactions: Transaction[]
  
  // Движения склада
  stockMovements: StockMovement[]
  
  // Навигация
  activePage: AppPage
  selectedCategory: string
  isScannerOpen: boolean
}

/** Действия Zustand store */
export interface StoreActions {
  // Настройки
  updateSettings: (newSettings: Partial<Settings>) => void
  getCurrencySymbol: () => string
  getCurrency: () => Currency
  setTheme: (theme: Theme) => void

  // Авторизация
  login: (pin: string) => { success: boolean; cashier?: Cashier }
  logout: () => void
  addCashier: (cashier: Omit<Cashier, 'id'>) => void
  updateCashier: (id: number, updates: Partial<Cashier>) => void
  deleteCashier: (id: number) => void

  // Товары
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: number, updates: Partial<Product>) => void
  deleteProduct: (id: number) => void
  findProductByBarcode: (barcode: string) => Product | undefined
  isProductAvailable: (productId: number) => boolean
  getProductAvailabilityInfo: (productId: number) => { available: boolean; time?: string } | null

  // Корзина
  addToCart: (product: Product | CartItem) => void
  removeFromCart: (productId: number) => void
  updateCartQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // Продажи
  completeSale: (paymentMethod: PaymentMethod, receivedAmount?: number | null) => Transaction

  // Склад
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'cashier' | 'date'>) => void

  // Навигация
  setActivePage: (page: AppPage) => void
  setSelectedCategory: (category: string) => void
  setScannerOpen: (isOpen: boolean) => void
  setShowOnboarding: (show: boolean) => void

  // Поиск
  searchProducts: (query: string) => Product[]

  // Рекомендации
  getRecommendations: () => Product[]
  getAvailableCombos: () => Combo[]
  getSmartRecommendations: () => Array<Product & { reason: string }>
  getRecommendedAccessories: () => Accessory[]
  addComboToCart: (comboId: string, autoAdd?: boolean) => boolean
  addAccessoryToCart: (accessoryId: string) => void

  // Статистика
  getTodayStats: () => DayStats
  getWeekStats: () => DayStats[]

  // Сброс
  resetToDemo: () => void
  clearAllData: () => void
}

/** Статистика за день */
export interface DayStats {
  date?: Date
  salesCount: number
  revenue: number
  itemsSold: number
  averageCheck: number
  count?: number
}

/** Полный тип store */
export type Store = StoreState & StoreActions

// ============ OFFLINE / SYNC ============

/** Статус синхронизации */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict'

/** Элемент очереди синхронизации */
export interface SyncQueueItem {
  id?: number
  type: 'transaction' | 'product' | 'stock_movement'
  data: unknown
  status: SyncStatus
  createdAt: string
  syncedAt?: string
  error?: string
  retryCount: number
}

/** Событие синхронизации */
export interface SyncEvent {
  type: 'online' | 'offline' | 'sync_start' | 'sync_complete' | 'sync_error' | 'queued'
  synced?: number
  failed?: number
  dataType?: string
  error?: Error
}

/** Оценка хранилища */
export interface StorageEstimate {
  quota: number
  usage: number
  percent: number
  available: number
  formatted: {
    quota: string
    usage: string
    available: string
  }
}

// ============ COMPONENTS ============

/** Props для компонента помощи */
export interface HelpButtonProps {
  module: 'pos' | 'products' | 'stock' | 'reports' | 'settings' | 'catalog' | 'discounts'
}

/** Props для Error Boundary */
export interface ErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

/** Состояние Error Boundary */
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/** Props для SwipeToDelete */
export interface SwipeToDeleteProps {
  children: ReactNode
  onDelete: () => void
  threshold?: number
  disabled?: boolean
}

/** Props для Skeleton */
export interface SkeletonProps {
  className?: string
  variant?: 'rect' | 'circle' | 'text'
}

/** Props для ConfirmDialog */
export interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Props для InputDialog */
export interface InputDialogProps {
  title: string
  message: string
  placeholder?: string
  defaultValue?: string
  onClose: () => void
  onSubmit: (value: string) => void
}

/** Props для UndoToast */
export interface UndoToastProps {
  message: string
  countdown: number
  onUndo: () => void
}

/** Props для StatusToast */
export interface StatusToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

/** Props для ProductCard в сетке */
export interface ProductGridItemProps {
  product: Product
  cartQuantity: number
  isAvailable: boolean
  availabilityInfo: { available: boolean; time?: string } | null
  onAdd: (product: Product) => void
  formatPrice: (price: number) => string
}

/** Props для Recommendations */
export interface RecommendationsProps {
  compact?: boolean
}

/** Props для Navigation */
export interface NavigationProps {
  cartCount?: number
}

/** Props для ThemeProvider */
export interface ThemeProviderProps {
  children: ReactNode
}

// ============ PRINT SERVICE ============

/** Настройки печати чека */
export interface PrintSettings {
  storeName?: string
  storeAddress?: string
  storePhone?: string
  currency?: string
  showLogo?: boolean
}

/** Чек для печати */
export interface PrintReceipt extends Transaction {
  storeName?: string
}

// ============ UTILITY TYPES ============

/** Глубокий Partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** Извлечь ключи с определённым типом значения */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/** Сделать определённые ключи обязательными */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/** Сделать определённые ключи необязательными */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
