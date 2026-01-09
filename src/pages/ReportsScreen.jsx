import { useStore } from '../store/useStore'
import { TrendingUp, ShoppingBag, DollarSign, Package, ArrowUpRight, ArrowDownRight, Calendar, Users, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { HelpButton } from '../components/HelpSystem'

export default function ReportsScreen() {
  const { 
    transactions, 
    products, 
    getTodayStats, 
    getWeekStats,
    getCurrencySymbol,
    currentCashier,
    settings
  } = useStore()

  const todayStats = getTodayStats()
  const weekStats = getWeekStats()
  const currencySymbol = getCurrencySymbol()

  const formatPrice = (price) => `${price.toLocaleString()} ${currencySymbol}`

  // Total sales all time
  const totalRevenue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.total, 0)

  // Stock value
  const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  // Top products
  const productSales = {}
  transactions.forEach(t => {
    if (t.type === 'sale') {
      t.items.forEach(item => {
        productSales[item.id] = (productSales[item.id] || 0) + item.quantity
      })
    }
  })

  const topProducts = Object.entries(productSales)
    .map(([id, qty]) => ({
      product: products.find(p => p.id === parseInt(id)),
      quantity: qty
    }))
    .filter(item => item.product)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Max daily revenue for chart scaling
  const maxDayRevenue = Math.max(...weekStats.map(d => d.revenue), 1)

  // Print last receipt
  const printLastReceipt = () => {
    const lastTransaction = transactions[0]
    if (!lastTransaction) return

    const receiptWindow = window.open('', '_blank', 'width=300,height=600')
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Чек ${lastTransaction.receiptNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 280px; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="center bold">${settings.storeName}</div>
          ${settings.storeAddress ? `<div class="center" style="font-size: 0.9em">${settings.storeAddress}</div>` : ''}
          <div class="center" style="margin-top: 5px">${lastTransaction.receiptNumber}</div>
          <div class="center" style="font-size: 0.9em">${format(new Date(lastTransaction.date), 'dd.MM.yyyy HH:mm')}</div>
          <div class="line"></div>
          ${lastTransaction.items.map(item => `
            <div>${item.name}</div>
            <div class="row">
              <span>${item.quantity} x ${formatPrice(item.price)}</span>
              <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="row total bold">
            <span>ИТОГО:</span>
            <span>${formatPrice(lastTransaction.total)}</span>
          </div>
          <div class="row">
            <span>Оплата:</span>
            <span>${lastTransaction.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}</span>
          </div>
          ${lastTransaction.receivedAmount > lastTransaction.total ? `
            <div class="row">
              <span>Получено:</span>
              <span>${formatPrice(lastTransaction.receivedAmount)}</span>
            </div>
            <div class="row">
              <span>Сдача:</span>
              <span>${formatPrice(lastTransaction.change)}</span>
            </div>
          ` : ''}
          <div class="line"></div>
          <div class="row" style="font-size: 0.9em">
            <span>Кассир:</span>
            <span>${lastTransaction.cashier}</span>
          </div>
          <div class="line"></div>
          <div class="center" style="margin-top: 10px; font-size: 0.9em">${settings.receiptFooter}</div>
        </body>
      </html>
    `)
    receiptWindow.document.close()
    receiptWindow.print()
  }

  return (
    <div className="h-full overflow-y-auto p-4 bg-themed-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-themed-primary">Отчёты</h1>
        <HelpButton module="reports" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-ios-blue/20 to-ios-blue/5 border border-ios-blue/30 rounded-ios-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-ios-blue" size={24} />
            <span className="text-xs text-ios-blue bg-ios-blue/20 px-2 py-1 rounded-ios-full">
              Сегодня
            </span>
          </div>
          <div className="text-2xl font-bold text-themed-primary">
            {formatPrice(todayStats.revenue)}
          </div>
          <div className="text-sm text-themed-secondary">Выручка</div>
        </div>

        <div className="bg-gradient-to-br from-ios-teal/20 to-ios-teal/5 border border-ios-teal/30 rounded-ios-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="text-ios-teal" size={24} />
            <span className="text-xs text-ios-teal bg-ios-teal/20 px-2 py-1 rounded-ios-full">
              Сегодня
            </span>
          </div>
          <div className="text-2xl font-bold text-themed-primary">
            {todayStats.salesCount}
          </div>
          <div className="text-sm text-themed-secondary">Продаж</div>
        </div>

        <div className="bg-gradient-to-br from-ios-purple/20 to-ios-purple/5 border border-ios-purple/30 rounded-ios-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-ios-purple" size={24} />
          </div>
          <div className="text-2xl font-bold text-themed-primary">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-sm text-themed-secondary">Всего продаж</div>
        </div>

        <div className="bg-gradient-to-br from-ios-orange/20 to-ios-orange/5 border border-ios-orange/30 rounded-ios-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-ios-orange" size={24} />
          </div>
          <div className="text-2xl font-bold text-themed-primary">
            {formatPrice(stockValue)}
          </div>
          <div className="text-sm text-themed-secondary">Склад</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="ios-card-grouped rounded-ios-lg p-4">
          <div className="text-themed-secondary text-sm mb-1">Средний чек</div>
          <div className="text-xl font-bold text-themed-primary">
            {formatPrice(Math.round(todayStats.averageCheck))}
          </div>
        </div>
        <div className="ios-card-grouped rounded-ios-lg p-4">
          <div className="text-themed-secondary text-sm mb-1">Продано товаров</div>
          <div className="text-xl font-bold text-themed-primary">
            {todayStats.itemsSold} шт
          </div>
        </div>
        <div className="ios-card-grouped rounded-ios-lg p-4">
          <div className="text-themed-secondary text-sm mb-1">Кассир</div>
          <div className="text-xl font-bold text-themed-primary flex items-center gap-2">
            <Users size={18} className="text-themed-secondary" />
            {currentCashier?.name}
          </div>
        </div>
        <div className="ios-card-grouped rounded-ios-lg p-4">
          <button
            onClick={printLastReceipt}
            disabled={transactions.length === 0}
            className="w-full h-full flex items-center justify-center gap-2 text-themed-secondary hover:text-ios-blue transition-colors disabled:opacity-50 ios-press"
          >
            <Printer size={20} />
            <span>Печать чека</span>
          </button>
        </div>
      </div>

      {/* Week Chart */}
      <div className="ios-card rounded-ios-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-themed-primary">
          <Calendar size={20} className="text-ios-blue" />
          Выручка за неделю
        </h3>
        
        <div className="flex items-end justify-between gap-2 h-40">
          {weekStats.map((day, idx) => {
            const height = maxDayRevenue > 0 ? (day.revenue / maxDayRevenue) * 100 : 0
            const isToday = day.date.toDateString() === new Date().toDateString()
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  {day.revenue > 0 && (
                    <div className="text-xs text-themed-tertiary mb-1">
                      {formatPrice(day.revenue)}
                    </div>
                  )}
                  <div
                    className={`
                      w-full rounded-t-ios transition-all
                      ${isToday ? 'bg-ios-blue' : 'bg-fill-tertiary'}
                    `}
                    style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px' }}
                  />
                </div>
                <div className={`text-xs ${isToday ? 'text-ios-blue font-bold' : 'text-themed-secondary'}`}>
                  {format(day.date, 'EEE', { locale: ru })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="ios-card rounded-ios-xl p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-themed-primary">
            <TrendingUp size={20} className="text-ios-blue" />
            Топ продаж
          </h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-themed-tertiary">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
              <p>Нет данных о продажах</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, idx) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 ios-card-grouped rounded-ios-lg">
                  <div className={`
                    w-8 h-8 rounded-ios flex items-center justify-center font-bold text-sm
                    ${idx === 0 ? 'bg-ios-yellow/20 text-ios-yellow' :
                      idx === 1 ? 'bg-themed-tertiary/20 text-themed-secondary' :
                      idx === 2 ? 'bg-ios-orange/20 text-ios-orange' :
                      'bg-fill-tertiary text-themed-secondary'}
                  `}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-themed-primary">{item.product.name}</div>
                    <div className="text-sm text-themed-secondary">{item.product.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-ios-blue">{item.quantity} шт</div>
                    <div className="text-sm text-themed-secondary">
                      {formatPrice(item.quantity * item.product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Transactions */}
        <div className="ios-card rounded-ios-xl p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-themed-primary">
            <ShoppingBag size={20} className="text-ios-teal" />
            Последние продажи
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-themed-tertiary">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
              <p>Нет продаж</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 ios-card-grouped rounded-ios-lg">
                  <div className={`
                    w-10 h-10 rounded-ios flex items-center justify-center
                    ${tx.type === 'sale' ? 'bg-ios-green/20' : 'bg-ios-red/20'}
                  `}>
                    {tx.type === 'sale' ? (
                      <ArrowUpRight className="text-ios-green" size={20} />
                    ) : (
                      <ArrowDownRight className="text-ios-red" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-themed-primary">
                      {tx.receiptNumber}
                    </div>
                    <div className="text-sm text-themed-secondary">
                      {tx.items.length} товар(ов) • {tx.paymentMethod === 'cash' ? 'Наличные' : 'Карта'}
                      {tx.cashier && ` • ${tx.cashier}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-ios-green">+{formatPrice(tx.total)}</div>
                    <div className="text-xs text-themed-tertiary">
                      {format(new Date(tx.date), 'd MMM, HH:mm', { locale: ru })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
