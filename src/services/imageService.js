/**
 * Image Service
 * Управление изображениями товаров и категорий
 * Сохраняет в IndexedDB для офлайн-доступа
 */

const DB_NAME = 'pos-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

let db = null

/**
 * Инициализация базы данных
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Сжатие изображения
 * @param {File} file - Файл изображения
 * @param {number} maxWidth - Максимальная ширина
 * @param {number} quality - Качество (0-1)
 * @returns {Promise<string>} - Base64 строка
 */
export const compressImage = (file, maxWidth = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Масштабирование
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Конвертация в base64
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Сохранить изображение
 * @param {string} id - Идентификатор (product_123, category_name)
 * @param {string} dataUrl - Base64 изображение
 */
export const saveImage = async (id, dataUrl) => {
  try {
    await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ id, dataUrl, updatedAt: Date.now() })
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error saving image:', error)
    // Fallback to localStorage
    try {
      localStorage.setItem(`image_${id}`, dataUrl)
      return true
    } catch (e) {
      console.error('LocalStorage fallback failed:', e)
      return false
    }
  }
}

/**
 * Загрузить изображение
 * @param {string} id - Идентификатор
 * @returns {Promise<string|null>}
 */
export const loadImage = async (id) => {
  try {
    await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)
      request.onsuccess = () => {
        resolve(request.result?.dataUrl || null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    // Fallback to localStorage
    const data = localStorage.getItem(`image_${id}`)
    return data || null
  }
}

/**
 * Удалить изображение
 * @param {string} id - Идентификатор
 */
export const deleteImage = async (id) => {
  try {
    await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    localStorage.removeItem(`image_${id}`)
    return true
  }
}

/**
 * Хук для работы с изображениями
 */
export const useProductImage = () => {
  const uploadProductImage = async (productId, file) => {
    const compressed = await compressImage(file)
    await saveImage(`product_${productId}`, compressed)
    return compressed
  }

  const getProductImage = (productId) => {
    return loadImage(`product_${productId}`)
  }

  const removeProductImage = (productId) => {
    return deleteImage(`product_${productId}`)
  }

  return { uploadProductImage, getProductImage, removeProductImage }
}

/**
 * Хук для работы с изображениями категорий
 */
export const useCategoryImage = () => {
  const uploadCategoryImage = async (categoryName, file) => {
    const compressed = await compressImage(file, 200, 0.7)
    await saveImage(`category_${categoryName}`, compressed)
    return compressed
  }

  const getCategoryImage = (categoryName) => {
    return loadImage(`category_${categoryName}`)
  }

  const removeCategoryImage = (categoryName) => {
    return deleteImage(`category_${categoryName}`)
  }

  return { uploadCategoryImage, getCategoryImage, removeCategoryImage }
}
