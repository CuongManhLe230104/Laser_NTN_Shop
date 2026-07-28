import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'

// ─── 1. Tạo Context ──────────────────────────────────────────────────────────
const CartContext = createContext(null)

// ─── 2. Provider ─────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 })
  const [loading, setLoading] = useState(false)

  // Fetch giỏ hàng từ backend
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart({ items: [], total: 0, itemCount: 0 })
      return
    }

    try {
      setLoading(true)
      const res = await cartAPI.getCart()
      if (res.data.success) {
        const items = res.data.data.items || []
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
        setCart({ items, total, itemCount })
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  // Tự động tải giỏ hàng khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isLoggedIn) return { success: false, requireLogin: true }
    try {
      const res = await cartAPI.addItem({ product_id: productId, quantity })
      if (res.data.success) {
        await fetchCart()
        return { success: true }
      }
      return { success: false, message: res.data.message }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error)
      return { success: false, message: error.response?.data?.message || 'Đã có lỗi xảy ra' }
    }
  }, [isLoggedIn, fetchCart])

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      const res = await cartAPI.updateItem(itemId, { quantity: newQuantity })
      if (res.data.success) {
        await fetchCart()
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('Lỗi khi cập nhật giỏ hàng:', error)
      return { success: false }
    }
  }, [fetchCart])

  // Xóa 1 sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback(async (itemId) => {
    try {
      const res = await cartAPI.removeItem(itemId)
      if (res.data.success) {
        await fetchCart()
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('Lỗi khi xóa khỏi giỏ hàng:', error)
      return { success: false }
    }
  }, [fetchCart])

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async () => {
    try {
      const res = await cartAPI.clearCart()
      if (res.data.success) {
        setCart({ items: [], total: 0, itemCount: 0 })
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('Lỗi khi dọn dẹp giỏ hàng:', error)
      return { success: false }
    }
  }, [])

  const value = {
    cart,
    cartCount: cart.itemCount,
    items: cart.items,
    totalPrice: cart.total,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ─── 3. Custom Hook ───────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart() phải được sử dụng bên trong <CartProvider>')
  }
  return ctx
}
