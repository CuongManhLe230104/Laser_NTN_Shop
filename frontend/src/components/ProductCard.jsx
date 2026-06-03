import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiEye, FiStar } from 'react-icons/fi'
import { cartAPI } from '../services/api'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState(null)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      setAdding(true)
      setError(null)
      await cartAPI.addItem({ product_id: product.id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thêm vào giỏ')
      setTimeout(() => setError(null), 3000)
    } finally {
      setAdding(false)
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  return (
    <div className="product-card">
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="product-card__image-wrap">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300/1a1a2e/6c63ff?text=No+Image' }}
        />
        <div className="product-card__overlay">
          <FiEye size={20} /> Xem chi tiết
        </div>
        {product.stock === 0 && (
          <span className="product-card__badge product-card__badge--out">Hết hàng</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="product-card__badge product-card__badge--low">Sắp hết</span>
        )}
      </Link>

      {/* Content */}
      <div className="product-card__body">
        {product.category_name && (
          <span className="product-card__category">{product.category_name}</span>
        )}

        <Link to={`/products/${product.slug}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        <p className="product-card__desc">
          {product.description?.slice(0, 80)}...
        </p>

        <div className="product-card__rating">
          {[1, 2, 3, 4, 5].map((s) => (
            <FiStar key={s} size={12} fill={s <= 4 ? '#f59e0b' : 'none'} color="#f59e0b" />
          ))}
          <span>(4.0)</span>
        </div>

        <div className="product-card__footer">
          <span className="product-card__price">{formatPrice(product.price)}</span>

          <button
            className={`product-card__cart-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            title="Thêm vào giỏ hàng"
          >
            <FiShoppingCart size={16} />
            {adding ? '...' : added ? '✓' : 'Thêm'}
          </button>
        </div>

        {error && <p className="product-card__error">{error}</p>}
      </div>
    </div>
  )
}
