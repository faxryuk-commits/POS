import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Search, Edit2, Trash2, X, Save, Package, Image as ImageIcon } from 'lucide-react'
import { HelpButton, InfoTip, FieldError } from '../components/HelpSystem'
import { useConfirm, useUndoToast, useStatusToast } from '../components/ConfirmDialog'
import ImageUpload from '../components/ImageUpload'
import { loadImage, saveImage } from '../services/imageService'

// Category icons mapping
const categoryIcons = {
  'Напитки': '🥤',
  'Сладости': '🍫',
  'Хлеб': '🍞',
  'Молочные': '🥛',
  'Фрукты': '🍎',
  'Снеки': '🍿',
  'Табак': '🚬',
  'Алкоголь': '🍺',
}

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Напитки',
    barcode: '',
    image: null
  })
  const [productImages, setProductImages] = useState({})

  const { products, categories, addProduct, updateProduct, deleteProduct, getCurrencySymbol } = useStore()

  // Загрузка изображений товаров
  useEffect(() => {
    const loadProductImages = async () => {
      const images = {}
      for (const product of products) {
        const img = await loadImage(`product_${product.id}`)
        if (img) images[product.id] = img
      }
      setProductImages(images)
    }
    if (products.length > 0) {
      loadProductImages()
    }
  }, [products])
  const currencySymbol = getCurrencySymbol()
  const formatPrice = (price) => `${price.toLocaleString()} ${currencySymbol}`
  const confirm = useConfirm()
  const showUndoToast = useUndoToast()
  const { success } = useStatusToast()
  
  // Временное хранилище для отмены удаления
  const [pendingDelete, setPendingDelete] = useState(null)

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  )

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        barcode: product.barcode,
        image: productImages[product.id] || null
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        price: '',
        stock: '',
        category: 'Напитки',
        barcode: Date.now().toString(),
        image: null
      })
    }
    setShowModal(true)
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Введите название товара'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Минимум 2 символа'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Цена должна быть больше 0'
    } else if (parseFloat(formData.price) > 10000000) {
      newErrors.price = 'Слишком большая цена'
    }
    
    if (formData.stock === '' || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Остаток не может быть отрицательным'
    } else if (parseInt(formData.stock) > 1000000) {
      newErrors.stock = 'Слишком большое количество'
    }
    
    if (formData.barcode && !/^\d+$/.test(formData.barcode)) {
      newErrors.barcode = 'Только цифры'
    }
    
    // Check for duplicate barcode
    const existingProduct = products.find(p => 
      p.barcode === formData.barcode && p.id !== editingProduct?.id
    )
    if (existingProduct) {
      newErrors.barcode = `Штрих-код уже используется: ${existingProduct.name}`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Генерируем ID заранее для новых товаров
    const newProductId = editingProduct?.id || Date.now()
    
    const productData = {
      id: newProductId,
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      barcode: formData.barcode || newProductId.toString()
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      // Сохраняем изображение
      if (formData.image) {
        await saveImage(`product_${editingProduct.id}`, formData.image)
        setProductImages(prev => ({ ...prev, [editingProduct.id]: formData.image }))
      }
      success(`Товар "${productData.name}" обновлён`)
    } else {
      // Добавляем товар с заранее сгенерированным ID
      addProduct(productData)
      // Сохраняем изображение для нового товара
      if (formData.image) {
        await saveImage(`product_${newProductId}`, formData.image)
        setProductImages(prev => ({ ...prev, [newProductId]: formData.image }))
      }
      success(`Товар "${productData.name}" добавлен`)
    }

    setShowModal(false)
    setErrors({})
  }

  const handleDelete = (product) => {
    // Сохраняем товар для возможности отмены
    const productToDelete = { ...product }
    setPendingDelete(productToDelete)
    
    // Скрываем товар из списка (визуальное удаление)
    // Реальное удаление произойдёт через 5 секунд
    
    showUndoToast({
      message: `"${product.name}" удалён`,
      onUndo: () => {
        // Отмена - ничего не делаем, товар остаётся
        setPendingDelete(null)
        success('Удаление отменено')
      },
      onComplete: () => {
        // Реальное удаление
        deleteProduct(productToDelete.id)
        setPendingDelete(null)
      },
      duration: 5
    })
  }
  
  // Фильтруем товары, исключая тот что в процессе удаления
  const displayProducts = filteredProducts.filter(p => 
    !pendingDelete || p.id !== pendingDelete.id
  )

  return (
    <div className="h-full flex flex-col p-4 bg-themed-primary">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-tertiary" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск товара..."
            className="w-full h-12 pl-11 pr-4 ios-input"
          />
        </div>
        <HelpButton module="products" />
        <button
          onClick={() => openModal()}
          className="h-12 px-4 sm:px-6 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center gap-2 hover:bg-ios-blue/90 transition-all ios-press"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Добавить товар</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        <div className="ios-card-grouped p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-themed-primary">{products.length}</div>
          <div className="text-xs sm:text-sm text-themed-secondary truncate">Всего</div>
        </div>
        <div className="ios-card-grouped p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-ios-orange">
            {products.filter(p => p.stock <= 5 && p.stock > 0).length}
          </div>
          <div className="text-xs sm:text-sm text-themed-secondary truncate">Мало</div>
        </div>
        <div className="ios-card-grouped p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-ios-red">
            {products.filter(p => p.stock === 0).length}
          </div>
          <div className="text-xs sm:text-sm text-themed-secondary truncate">Нет</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 overflow-hidden ios-card rounded-ios-xl">
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="sticky top-0 bg-themed-secondary">
              <tr className="text-left text-sm text-themed-secondary">
                <th className="p-4 font-medium">Товар</th>
                <th className="p-4 font-medium">Категория</th>
                <th className="p-4 font-medium text-right">Цена</th>
                <th className="p-4 font-medium text-right">Остаток</th>
                <th className="p-4 font-medium text-center">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator">
              {displayProducts.map((product) => (
                <tr key={product.id} className="hover:bg-fill-quaternary transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-fill-tertiary rounded-ios-lg flex items-center justify-center text-xl">
                        {categoryIcons[product.category] || '📦'}
                      </div>
                      <div>
                        <div className="font-medium text-themed-primary">{product.name}</div>
                        <div className="text-xs text-themed-tertiary font-mono">{product.barcode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-fill-tertiary rounded-ios text-sm text-themed-secondary">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-medium text-ios-blue">
                      {formatPrice(product.price)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`
                      px-3 py-1 rounded-ios text-sm font-medium
                      ${product.stock === 0
                        ? 'bg-ios-red/20 text-ios-red'
                        : product.stock <= 5
                        ? 'bg-ios-orange/20 text-ios-orange'
                        : 'bg-fill-tertiary text-themed-secondary'
                      }
                    `}>
                      {product.stock} шт
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="w-9 h-9 bg-fill-tertiary rounded-ios flex items-center justify-center text-themed-secondary hover:bg-ios-blue/20 hover:text-ios-blue transition-colors ios-press"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="w-9 h-9 bg-fill-tertiary rounded-ios flex items-center justify-center text-themed-secondary hover:bg-ios-red/20 hover:text-ios-red transition-colors ios-press"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayProducts.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-themed-tertiary">
              <Package size={48} className="mb-3 opacity-50" />
              <p>Товары не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative ios-modal w-full max-w-md">
            <div className="p-5 border-b border-separator flex items-center justify-between">
              <h3 className="text-ios-title3 font-semibold text-themed-primary">
                {editingProduct ? 'Редактировать товар' : 'Новый товар'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-fill-tertiary rounded-full flex items-center justify-center text-themed-secondary hover:bg-fill-secondary transition-colors ios-press"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Изображение и название */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <label className="block text-sm text-themed-secondary mb-2">Фото</label>
                  <ImageUpload
                    id={editingProduct ? `product_${editingProduct.id}` : null}
                    currentImage={formData.image}
                    onImageChange={(img) => setFormData({ ...formData, image: img })}
                    size="md"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-themed-secondary mb-2">Название *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: null })
                    }}
                    className={`w-full h-12 px-4 ios-input ${
                      errors.name ? 'ring-2 ring-ios-red' : ''
                    }`}
                    placeholder="Coca-Cola 0.5л"
                  />
                  <FieldError error={errors.name} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Цена ({currencySymbol}) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value })
                      if (errors.price) setErrors({ ...errors, price: null })
                    }}
                    min="0"
                    step="0.01"
                    className={`w-full h-12 px-4 ios-input ${
                      errors.price ? 'ring-2 ring-ios-red' : ''
                    }`}
                    placeholder="89"
                  />
                  <FieldError error={errors.price} />
                </div>
                <div>
                  <label className="block text-sm text-themed-secondary mb-2">Остаток *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => {
                      setFormData({ ...formData, stock: e.target.value })
                      if (errors.stock) setErrors({ ...errors, stock: null })
                    }}
                    min="0"
                    className={`w-full h-12 px-4 ios-input ${
                      errors.stock ? 'ring-2 ring-ios-red' : ''
                    }`}
                    placeholder="50"
                  />
                  <FieldError error={errors.stock} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 px-4 ios-input appearance-none"
                >
                  {categories.filter(c => c !== 'Все').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-themed-secondary mb-2">Штрих-код</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => {
                    setFormData({ ...formData, barcode: e.target.value.replace(/\D/g, '') })
                    if (errors.barcode) setErrors({ ...errors, barcode: null })
                  }}
                  className={`w-full h-12 px-4 ios-input font-mono ${
                    errors.barcode ? 'ring-2 ring-ios-red' : ''
                  }`}
                  placeholder="Автоматически"
                />
                <FieldError error={errors.barcode} />
                {!formData.barcode && !errors.barcode && (
                  <p className="text-xs text-themed-tertiary mt-1">Оставьте пустым для автогенерации</p>
                )}
              </div>

              <InfoTip>
                Поля со * обязательны. Цена и остаток должны быть числами.
              </InfoTip>

              <button
                type="submit"
                className="w-full h-12 bg-ios-blue text-white rounded-ios-lg font-semibold flex items-center justify-center gap-2 hover:bg-ios-blue/90 transition-all ios-press mt-2"
              >
                <Save size={20} />
                {editingProduct ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
