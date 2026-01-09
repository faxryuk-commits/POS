import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { X, Camera, Flashlight, FlashlightOff, AlertCircle, Check } from 'lucide-react'

export default function BarcodeScanner({ onClose, onScan }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [torch, setTorch] = useState(false)
  const [lastScanned, setLastScanned] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const streamRef = useRef(null)

  const { findProductByBarcode, addToCart } = useStore()

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      setHasCamera(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (track?.getCapabilities()?.torch) {
      await track.applyConstraints({
        advanced: [{ torch: !torch }]
      })
      setTorch(!torch)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode) {
      processBarcode(manualCode)
    }
  }

  const processBarcode = (code) => {
    const product = findProductByBarcode(code)
    
    if (product) {
      addToCart(product)
      setLastScanned({ success: true, product, code })
      onScan?.(product)
      
      // Вибрация при успехе
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } else {
      setLastScanned({ success: false, code })
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
    }
    
    setManualCode('')
    setTimeout(() => setLastScanned(null), 2000)
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
      <div className="flex items-center justify-between p-4 bg-surface-900/80 backdrop-blur-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera size={20} className="text-primary-400" />
          Сканер штрих-кода
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-surface-800 rounded-full flex items-center justify-center text-surface-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Область камеры */}
      <div className="flex-1 relative overflow-hidden">
        {hasCamera ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Рамка сканирования */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-40 border-2 border-primary-500 rounded-lg">
                  {/* Уголки */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                  
                  {/* Линия сканирования */}
                  <div className="absolute inset-x-2 top-1/2 h-0.5 bg-primary-500 animate-pulse" />
                </div>
                <p className="text-center text-surface-400 mt-4 text-sm">
                  Наведите камеру на штрих-код
                </p>
              </div>
            </div>

            {/* Кнопка фонарика */}
            <button
              onClick={toggleTorch}
              className="absolute top-4 right-4 w-12 h-12 bg-surface-900/80 rounded-full flex items-center justify-center text-white"
            >
              {torch ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-surface-400">
            <div className="text-center">
              <Camera size={48} className="mx-auto mb-4 opacity-50" />
              <p>Камера недоступна</p>
              <p className="text-sm mt-1">Введите код вручную</p>
            </div>
          </div>
        )}

        {/* Уведомление о сканировании */}
        {lastScanned && (
          <div className={`
            absolute top-20 left-4 right-4 p-4 rounded-xl animate-slide-up
            ${lastScanned.success
              ? 'bg-primary-500 text-black'
              : 'bg-red-500 text-white'
            }
          `}>
            <div className="flex items-center gap-3">
              {lastScanned.success ? (
                <>
                  <Check size={24} />
                  <div>
                    <div className="font-semibold">{lastScanned.product.name}</div>
                    <div className="text-sm opacity-80">Добавлен в корзину</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={24} />
                  <div>
                    <div className="font-semibold">Товар не найден</div>
                    <div className="text-sm opacity-80">Код: {lastScanned.code}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div className="p-4 bg-surface-900/80 backdrop-blur-sm">
        {/* Ручной ввод */}
        <form onSubmit={handleManualSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Введите штрих-код..."
            className="flex-1 h-12 px-4 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!manualCode}
            className={`
              px-6 h-12 rounded-xl font-medium transition-all
              ${manualCode
                ? 'bg-primary-500 text-black hover:bg-primary-400'
                : 'bg-surface-700 text-surface-500'
              }
            `}
          >
            Найти
          </button>
        </form>

        {/* Демо кнопка */}
        <button
          onClick={simulateScan}
          className="w-full h-12 bg-surface-800 border border-surface-700 rounded-xl text-surface-300 hover:bg-surface-700 hover:text-white transition-colors"
        >
          🎯 Симулировать сканирование (демо)
        </button>
      </div>
    </div>
  )
}
