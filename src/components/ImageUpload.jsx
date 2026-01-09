import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, Image as ImageIcon, Loader2, Info } from 'lucide-react'
import { compressImage, saveImage, loadImage, deleteImage } from '../services/imageService'

/**
 * Универсальный компонент загрузки изображений
 * Поддерживает: выбор файла, камера, drag & drop
 */
export default function ImageUpload({ 
  id, // Идентификатор для сохранения (product_1, category_Напитки)
  currentImage = null,
  onImageChange,
  size = 'md', // sm, md, lg
  shape = 'square', // square, circle
  placeholder = null,
  disabled = false,
  showHint = true // Показывать подсказку по размеру
}) {
  const [image, setImage] = useState(currentImage)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Размеры
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  // Синхронизация с внешним currentImage
  useEffect(() => {
    if (currentImage !== image) {
      setImage(currentImage)
    }
  }, [currentImage])

  // Загрузка сохранённого изображения
  useEffect(() => {
    if (id && !currentImage && !image) {
      loadImage(id).then((savedImage) => {
        if (savedImage) {
          setImage(savedImage)
          onImageChange?.(savedImage)
        }
      })
    }
  }, [id])

  // Обработка файла
  const handleFile = async (file) => {
    if (!file || disabled) return

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверка размера (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10MB')
      return
    }

    setLoading(true)
    try {
      const compressed = await compressImage(file, 400, 0.8)
      
      if (id) {
        await saveImage(id, compressed)
      }
      
      setImage(compressed)
      onImageChange?.(compressed)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Ошибка при обработке изображения')
    } finally {
      setLoading(false)
    }
  }

  // Обработчики событий
  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  // Удаление изображения
  const handleRemove = async (e) => {
    e.stopPropagation()
    if (id) {
      await deleteImage(id)
    }
    setImage(null)
    onImageChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Открытие камеры (на мобильных)
  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  // Открытие галереи
  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={openGallery}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative ${sizes[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}
          border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${dragOver 
            ? 'border-ios-blue bg-ios-blue/10' 
            : 'border-gray-300 dark:border-gray-600 hover:border-ios-blue hover:bg-ios-blue/5'
          }
          ${image ? 'border-solid border-transparent' : ''}
        `}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader2 className="animate-spin text-ios-blue" size={24} />
          </div>
        ) : image ? (
          <>
            <img
              src={image}
              alt="Preview"
              className={`w-full h-full object-cover ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 w-6 h-6 bg-ios-red text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            {placeholder || (
              <>
                <ImageIcon size={size === 'sm' ? 20 : 28} />
                {size !== 'sm' && (
                  <span className="text-[10px] mt-1">Фото</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Кнопки для мобильных */}
      {!image && !loading && !disabled && size !== 'sm' && (
        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={openCamera}
              className="p-1.5 text-gray-500 hover:text-ios-blue hover:bg-ios-blue/10 rounded-lg transition-colors"
              title="Камера"
            >
              <Camera size={16} />
            </button>
            <button
              type="button"
              onClick={openGallery}
              className="p-1.5 text-gray-500 hover:text-ios-blue hover:bg-ios-blue/10 rounded-lg transition-colors"
              title="Галерея"
            >
              <Upload size={16} />
            </button>
          </div>
          {showHint && (
            <p className="text-[9px] text-gray-400 text-center leading-tight">
              400×400px, до 10MB
            </p>
          )}
        </div>
      )}
      
      {/* Подсказка под изображением */}
      {image && showHint && size !== 'sm' && (
        <p className="text-[9px] text-gray-400 text-center mt-1">
          Нажмите для замены
        </p>
      )}
    </div>
  )
}

/**
 * Компактная версия для списков
 */
export function ImageUploadCompact({ id, currentImage, onImageChange, disabled }) {
  return (
    <ImageUpload
      id={id}
      currentImage={currentImage}
      onImageChange={onImageChange}
      size="sm"
      disabled={disabled}
    />
  )
}

/**
 * Круглая версия для аватаров/категорий
 */
export function ImageUploadCircle({ id, currentImage, onImageChange, size = 'md', disabled }) {
  return (
    <ImageUpload
      id={id}
      currentImage={currentImage}
      onImageChange={onImageChange}
      size={size}
      shape="circle"
      disabled={disabled}
    />
  )
}
