import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { cartAPI } from '../services/api'
import './Cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null) // item id being updated

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await cartAPI.getCart()
      setCart(res.data.data)
    } catch (err) {
      setError('Không thể tải giỏ hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const handleUpdateQty = async (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return

    try {
      setUpdating(item.id)
      await cartAPI.updateItem(item.id, { quantity: newQty })
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i),
        total: prev.items.reduce((sum, i) => sum + i.price * (i.id === item.id ? newQty : i.quantity), 0),
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cập nhật.')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (id) => {
    try {
      setUpdating(id)
      await cartAPI.removeItem(id)
      setCart((prev) => {
        const items = prev.items.filter((i) => i.id !== id)
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
        return { items, total, itemCount: items.length }
      })
    } catch (err) {
      setError('Lỗi xóa sản phẩm.')
    } finally {
      setUpdating(null)
    }
  }

  const handleClear = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return
    try {
      await cartAPI.clearCart()
      setCart({ items: [], total: 0, itemCount: 0 })
    } catch (err) {
      setError('Lỗi xóa giỏ hàng.')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '8px' }}>
          Giỏ <span className="gradient-text">Hàng</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          {cart.itemCount} sản phẩm trong giỏ hàng
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

        {cart.items.length === 0 ? (
          <div className="cart-page__empty glass-card">
            <FiShoppingBag size={64} color="var(--text-muted)" />
            <h2>Giỏ hàng trống</h2>
            <p>Hãy khám phá các sản phẩm của chúng tôi và thêm vào giỏ hàng nhé!</p>
            <Link to="/products" className="btn-primary">
              Khám Phá Sản Phẩm <FiArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            {/* Items */}
            <div className="cart-page__items">
              <div className="cart-page__items-header">
                <h3>Sản Phẩm</h3>
                <button className="cart-page__clear" onClick={handleClear}>
                  <FiTrash2 size={14} /> Xóa tất cả
                </button>
              </div>

              {cart.items.map((item) => (
                <div key={item.id} className={`cart-item glass-card ${updating === item.id ? 'updating' : ''}`}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="cart-item__image"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/1a1a2e/6c63ff?text=N/A' }}
                  />

                  <div className="cart-item__info">
                    <Link to={`/products/${item.slug}`} className="cart-item__name">{item.name}</Link>
                    <span className="cart-item__price">{formatPrice(item.price)}</span>
                  </div>

                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => handleUpdateQty(item, -1)}
                      disabled={updating === item.id || item.quantity <= 1}
                      aria-label="Giảm số lượng"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => handleUpdateQty(item, 1)}
                      disabled={updating === item.id}
                      aria-label="Tăng số lượng"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <span className="cart-item__subtotal">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item.id)}
                    disabled={updating === item.id}
                    aria-label="Xóa sản phẩm"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-page__summary glass-card">
              <h3>Tóm Tắt Đơn Hàng</h3>

              <div className="cart-summary__row">
                <span>Tạm tính</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Phí vận chuyển</span>
                <span style={{ color: 'var(--success)' }}>Miễn phí</span>
              </div>
              <div className="cart-summary__divider" />
              <div className="cart-summary__row cart-summary__row--total">
                <span>Tổng cộng</span>
                <span className="gradient-text">{formatPrice(cart.total)}</span>
              </div>

              <button
                id="checkout-btn"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px' }}
                onClick={() => navigate('/checkout')}
              >
                Tiến Hành Thanh Toán <FiArrowRight size={18} />
              </button>

              <Link to="/products" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
