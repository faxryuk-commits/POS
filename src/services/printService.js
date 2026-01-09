/**
 * Receipt Print Service
 * Generates and prints receipts in various formats
 */

/**
 * Generate receipt HTML
 */
export function generateReceiptHTML(receipt, settings = {}) {
  const {
    storeName = 'POS Store',
    storeAddress = '',
    storePhone = '',
    currency = '₽',
    showLogo = true,
  } = settings

  const formatPrice = (price) => `${price.toLocaleString()} ${currency}`
  const date = new Date(receipt.date)
  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Чек №${receipt.receiptNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          width: 80mm;
          padding: 10mm;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #333;
        }
        .store-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .store-info {
          font-size: 10px;
          color: #666;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #333;
        }
        .items {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #333;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .item-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .item-qty {
          width: 30px;
          text-align: center;
        }
        .item-price {
          width: 70px;
          text-align: right;
        }
        .totals {
          margin-bottom: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        .total-row.grand-total {
          font-size: 14px;
          font-weight: bold;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px solid #333;
        }
        .payment-info {
          padding: 10px 0;
          border-top: 1px dashed #333;
          border-bottom: 1px dashed #333;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        .barcode {
          text-align: center;
          margin: 10px 0;
          font-size: 8px;
        }
        @media print {
          body {
            width: 80mm;
            padding: 5mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${showLogo ? `<div style="font-size: 24px; margin-bottom: 5px;">🏪</div>` : ''}
        <div class="store-name">${storeName}</div>
        ${storeAddress ? `<div class="store-info">${storeAddress}</div>` : ''}
        ${storePhone ? `<div class="store-info">Тел: ${storePhone}</div>` : ''}
      </div>

      <div class="receipt-info">
        <div>
          <div>Чек №${receipt.receiptNumber}</div>
          <div>${formattedDate} ${formattedTime}</div>
        </div>
        <div style="text-align: right;">
          <div>Кассир: ${receipt.cashier || 'Не указан'}</div>
        </div>
      </div>

      <div class="items">
        <div class="item" style="font-weight: bold; margin-bottom: 8px;">
          <span class="item-name">Товар</span>
          <span class="item-qty">Кол</span>
          <span class="item-price">Сумма</span>
        </div>
        ${receipt.items.map(item => `
          <div class="item">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
          ${item.quantity > 1 ? `
            <div style="font-size: 10px; color: #666; margin-bottom: 3px;">
              ${formatPrice(item.price)} × ${item.quantity}
            </div>
          ` : ''}
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Подитог:</span>
          <span>${formatPrice(receipt.subtotal || receipt.total)}</span>
        </div>
        ${receipt.discount ? `
          <div class="total-row" style="color: #e53e3e;">
            <span>Скидка:</span>
            <span>-${formatPrice(receipt.discount)}</span>
          </div>
        ` : ''}
        ${receipt.tax ? `
          <div class="total-row">
            <span>НДС (${receipt.taxRate || 20}%):</span>
            <span>${formatPrice(receipt.tax)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>ИТОГО:</span>
          <span>${formatPrice(receipt.total)}</span>
        </div>
      </div>

      <div class="payment-info">
        <div class="total-row">
          <span>Способ оплаты:</span>
          <span>${getPaymentMethodName(receipt.paymentMethod)}</span>
        </div>
        ${receipt.received ? `
          <div class="total-row">
            <span>Получено:</span>
            <span>${formatPrice(receipt.received)}</span>
          </div>
          <div class="total-row">
            <span>Сдача:</span>
            <span>${formatPrice(receipt.received - receipt.total)}</span>
          </div>
        ` : ''}
      </div>

      <div class="barcode">
        <div style="letter-spacing: 3px; font-family: 'Libre Barcode 39', monospace;">
          *${receipt.receiptNumber}*
        </div>
        <div>${receipt.receiptNumber}</div>
      </div>

      <div class="footer">
        <p>Спасибо за покупку!</p>
        <p style="margin-top: 5px;">Сохраняйте чек для возврата</p>
        <p style="margin-top: 10px; font-size: 8px;">
          Дата печати: ${new Date().toLocaleString('ru-RU')}
        </p>
      </div>
    </body>
    </html>
  `
}

/**
 * Get payment method display name
 */
function getPaymentMethodName(method) {
  const methods = {
    cash: 'Наличные',
    card: 'Банковская карта',
    qr: 'QR-код',
    mixed: 'Смешанная оплата',
  }
  return methods[method] || method
}

/**
 * Print receipt
 */
export function printReceipt(receipt, settings = {}) {
  const html = generateReceiptHTML(receipt, settings)
  
  // Create print window
  const printWindow = window.open('', '_blank', 'width=300,height=600')
  if (!printWindow) {
    throw new Error('Не удалось открыть окно печати. Проверьте настройки блокировщика всплывающих окон.')
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    // Close window after printing (optional)
    // printWindow.close()
  }

  return true
}

/**
 * Download receipt as image (for mobile)
 */
export async function downloadReceiptAsImage(receipt, settings = {}) {
  // This would require html2canvas library
  // For now, we'll use the print method
  return printReceipt(receipt, settings)
}

/**
 * Send receipt via email (placeholder)
 */
export async function emailReceipt(receipt, email, settings = {}) {
  // This would require a backend API
  console.log('Email receipt to:', email)
  throw new Error('Отправка по email требует подключения к серверу')
}

/**
 * Generate receipt for thermal printer (ESC/POS format)
 * This is a placeholder for actual ESC/POS commands
 */
export function generateESCPOS(receipt, settings = {}) {
  // ESC/POS commands would go here
  // This requires direct connection to a thermal printer
  console.log('Generating ESC/POS commands for receipt:', receipt.receiptNumber)
  return null
}
