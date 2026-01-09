import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { X, Camera, Flashlight, FlashlightOff, AlertCircle, Check, ScanLine, Keyboard, RotateCcw } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

export default function BarcodeScanner({ onClose, onScan, onCreateProduct }) {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const [torch, setTorch] = useState(false)
  const [lastScanned, setLastScanned] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [notFoundCode, setNotFoundCode] = useState(null) // Код для создания товара
  const processedCodes = useRef(new Set())

  const { findProductByBarcode, addToCart } = useStore()

  // Поддерживаемые форматы штрих-кодов
  const supportedFormats = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
  ]

  const processBarcode = useCallback((code) => {
    // Предотвращаем повторное сканирование того же кода в течение 3 секунд
    if (processedCodes.current.has(code)) return
    processedCodes.current.add(code)
    setTimeout(() => processedCodes.current.delete(code), 3000)

    const product = findProductByBarcode(code)
    
    if (product) {
      addToCart(product)
      setLastScanned({ success: true, product, code })
      setNotFoundCode(null) // Сброс
      onScan?.(product)
      
      // Вибрация при успехе
      if (navigator.vibrate) {
        navigator.vibrate([50, 100])
      }
      
      setTimeout(() => setLastScanned(null), 3000)
    } else {
      setLastScanned({ success: false, code })
      setNotFoundCode(code) // Сохраняем для создания товара
      if (navigator.vibrate) {
        navigator.vibrate([30, 30, 30, 30])
      }
      
      // Не скрываем уведомление, чтобы пользователь мог создать товар
      setTimeout(() => setLastScanned(null), 5000)
    }
    
    setManualCode('')
  }, [findProductByBarcode, addToCart, onScan])
  
  // Создать товар по штрих-коду
  const handleCreateProduct = useCallback(() => {
    if (notFoundCode && onCreateProduct) {
      onCreateProduct(notFoundCode)
      onClose()
    }
  }, [notFoundCode, onCreateProduct, onClose])

  // Инициализация списка камер
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices)
          // Предпочитаем заднюю камеру
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          )
          setSelectedCamera(backCamera?.id || devices[devices.length - 1].id)
        } else {
          setHasCamera(false)
          setCameraError('Камеры не найдены')
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err)
        setHasCamera(false)
        setCameraError('Ошибка доступа к камере')
      })
  }, [])

  // Запуск сканера при выборе камеры
  useEffect(() => {
    if (!selectedCamera || !scannerRef.current) return

    const startScanner = async () => {
      try {
        // Остановить предыдущий сканер если есть
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop()
          } catch (e) {
            // Игнорируем ошибки остановки
          }
        }

        html5QrCodeRef.current = new Html5Qrcode('barcode-scanner-region', {
          formatsToSupport: supportedFormats,
          verbose: false
        })

        await html5QrCodeRef.current.start(
          selectedCamera,
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 16 / 9,
          },
          (decodedText) => {
            processBarcode(decodedText)
          },
          () => {
            // Ошибки сканирования игнорируем (это нормально когда нет штрих-кода в кадре)
          }
        )

        setIsScanning(true)
        setCameraError(null)
      } catch (err) {
        console.error('Scanner start error:', err)
        setCameraError(err.message || 'Ошибка запуска сканера')
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [selectedCamera, processBarcode])

  // Очистка при закрытии
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const toggleTorch = async () => {
    if (html5QrCodeRef.current) {
      try {
        const track = html5QrCodeRef.current.getRunningTrackCameraCapabilities()
        if (track?.torchFeature?.isSupported()) {
          await track.torchFeature.apply(!torch)
          setTorch(!torch)
        }
      } catch (err) {
        console.error('Torch error:', err)
      }
    }
  }

  const switchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.id === selectedCamera)
      const nextIndex = (currentIndex + 1) % cameras.length
      setSelectedCamera(cameras[nextIndex].id)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      processBarcode(manualCode.trim())
    }
  }

  // Симуляция сканирования для демо
  const simulateScan = () => {
    const demoCodes = [
      '4600000000001', '4600000000002', '4600000000003',
      '4600000000004', '4600000000005', '4600000000006'
    ]
    const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)]
    processBarcode(randomCode)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm safe-area-top">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ScanLine size={20} className="text-ios-blue" />
          Сканер штрих-кода
        </h2>
        <div className="flex items-center gap-2">
          {cameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title="Сменить камеру"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showManualInput ? 'bg-ios-blue text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Ручной ввод"
          >
            <Keyboard size={18} />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Область камеры */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {hasCamera && !cameraError ? (
          <>
            {/* Контейнер для html5-qrcode */}
            <div 
              id="barcode-scanner-region" 
              ref={scannerRef}
              className="w-full h-full"
              style={{ 
                position: 'relative',
                minHeight: '300px'
              }}
            />
            
            {/* Overlay с рамкой */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Затемнение вокруг зоны сканирования */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Рамка сканирования */}
                  <div className="w-72 h-40 border-2 border-ios-blue rounded-2xl relative overflow-hidden">
                    {/* Анимированная линия сканирования */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-ios-blue to-transparent animate-scan" />
                    
                    {/* Уголки */}
                    <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-ios-blue rounded-tl-xl" />
                    <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-ios-blue rounded-tr-xl" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-ios-blue rounded-bl-xl" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-ios-blue rounded-br-xl" />
                  </div>
                  
                  {/* Подсказка */}
                  <p className="text-center text-white/70 mt-4 text-sm">
                    {isScanning ? 'Наведите на штрих-код' : 'Запуск камеры...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопка фонарика */}
            <button
              onClick={toggleTorch}
              className={`absolute bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                torch ? 'bg-ios-yellow text-black' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {torch ? <FlashlightOff size={24} /> : <Flashlight size={24} />}
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/60">
            <div className="text-center p-6">
              <Camera size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium text-white mb-2">
                {cameraError || 'Камера недоступна'}
              </p>
              <p className="text-sm mb-6">Используйте ручной ввод штрих-кода</p>
              <button
                onClick={() => setShowManualInput(true)}
                className="px-6 py-3 bg-ios-blue text-white rounded-xl font-medium"
              >
                Ввести код вручную
              </button>
            </div>
          </div>
        )}

        {/* Уведомление о сканировании */}
        {lastScanned && (
          <div className={`
            absolute top-4 left-4 right-4 p-4 rounded-2xl shadow-2xl
            ${lastScanned.success
              ? 'bg-ios-green text-white'
              : 'bg-ios-orange text-white'
            }
            animate-ios-slide-up
          `}>
            <div className="flex items-center gap-3">
              {lastScanned.success ? (
                <>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Check size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{lastScanned.product.name}</div>
                    <div className="text-sm opacity-80">Добавлен в корзину</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg">Товар не найден</div>
                    <div className="text-sm opacity-80 font-mono truncate">{lastScanned.code}</div>
                  </div>
                  {onCreateProduct && (
                    <button
                      onClick={handleCreateProduct}
                      className="flex-shrink-0 px-4 py-2 bg-white text-ios-orange rounded-xl font-semibold hover:bg-white/90 transition-colors"
                    >
                      Создать
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Постоянная панель для создания товара */}
        {notFoundCode && !lastScanned && onCreateProduct && (
          <div className="absolute bottom-28 left-4 right-4 p-4 rounded-2xl shadow-2xl bg-surface-800 border border-surface-700 animate-ios-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ios-blue/20 rounded-full flex items-center justify-center">
                <ScanLine size={20} className="text-ios-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">Последний код:</div>
                <div className="text-sm text-white/60 font-mono truncate">{notFoundCode}</div>
              </div>
              <button
                onClick={handleCreateProduct}
                className="flex-shrink-0 px-4 py-2 bg-ios-blue text-white rounded-xl font-semibold hover:bg-ios-blue/80 transition-colors"
              >
                + Создать товар
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div className="p-4 bg-black/90 backdrop-blur-sm safe-area-bottom">
        {/* Ручной ввод */}
        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="flex gap-2 mb-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Введите штрих-код..."
              autoFocus
              className="flex-1 h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/30"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className={`
                px-6 h-12 rounded-xl font-semibold transition-all
                ${manualCode.trim()
                  ? 'bg-ios-blue text-white hover:bg-ios-blue/80'
                  : 'bg-white/10 text-white/40'
                }
              `}
            >
              Найти
            </button>
          </form>
        )}

        {/* Демо кнопка */}
        <button
          onClick={simulateScan}
          className="w-full h-12 bg-white/10 border border-white/20 rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
        >
          <span className="text-lg">🎯</span>
          Демо-сканирование
        </button>
        
        {/* Подсказка по форматам */}
        <p className="text-center text-white/40 text-xs mt-3">
          Поддерживаются: EAN-13, EAN-8, UPC, Code 128, QR и другие
        </p>
      </div>

      {/* CSS для анимации сканирования */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        #barcode-scanner-region video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #barcode-scanner-region > div {
          border: none !important;
        }
        #qr-shaded-region {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
