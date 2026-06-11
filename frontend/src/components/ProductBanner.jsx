import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiShoppingCart, FiArrowRight } from 'react-icons/fi'
import { productAPI, cartAPI } from '../services/api'
import './ProductBanner.css'

export default function ProductBanner() {
  const [products, setProducts] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)
  const [addedId, setAddedId] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    productAPI.getAll({ limit: 8, page: 1 })
      .then(res => setProducts(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Auto-play
  const next = useCallback(() => {
    setCurrent(c => (c + 1) % products.length)
  }, [products.length])

  const prev = () => {
    setCurrent(c => (c - 1 + products.length) % products.length)
  }

  const goTo = (idx) => {
    setCurrent(idx)
    resetTimer()
  }

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 4500)
  }, [next])

  useEffect(() => {
    if (products.length < 2) return
    timerRef.current = setInterval(next, 4500)
    return () => clearInterval(timerRef.current)
  }, [products.length, next])

  const handleAddToCart = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
    try {
      setAdding(product.id)
      await cartAPI.addItem({ product_id: product.id, quantity: 1 })
      setAddedId(product.id)
      setTimeout(() => setAddedId(null), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(null)
    }
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)

  if (loading) {
    return (
      <div className="product-banner product-banner--loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!products.length) return null

  const product = products[current]

  return (
    <section className="product-banner">
      {/* Header */}
      <div className="container">
        <div className="product-banner__header">
          <div>
            <span className="badge">🔥 Sản Phẩm Nổi Bật</span>
            <h2 className="section-title" style={{ marginTop: '12px' }}>
              Khám Phá <span className="gradient-text">Bộ Sưu Tập</span>
            </h2>
          </div>
          <Link to="/products" className="btn-secondary product-banner__see-all">
            Xem tất cả <FiArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div className="product-banner__track-wrap">
        <div className="container">
          <div className="product-banner__stage">

            {/* Prev Arrow */}
            <button
              className="product-banner__arrow product-banner__arrow--prev"
              onClick={() => { prev(); resetTimer() }}
              aria-label="Trước"
            >
              <FiChevronLeft size={22} />
            </button>

            {/* Slide */}
            <div className="product-banner__slide" key={product.id}>
              {/* Image side */}
              <Link
                to={`/products/${product.slug}`}
                className="product-banner__img-wrap"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="product-banner__img"
                  onError={e => { e.target.src = 'https://placehold.co/600x400/F4EFE6/B5722A?text=Laser+NTN' }}
                />
                {product.category_name && (
                  <span className="product-banner__cat">{product.category_name}</span>
                )}
              </Link>

              {/* Info side */}
              <div className="product-banner__info">
                <p className="product-banner__info-cat">{product.category_name}</p>
                <h3 className="product-banner__info-name">{product.name}</h3>
                <p className="product-banner__info-desc">
                  {product.description?.slice(0, 150)}...
                </p>

                <div className="product-banner__info-meta">
                  <div>
                    <span className="product-banner__info-label">Giá bán</span>
                    <span className="product-banner__info-price">{formatPrice(product.price)}</span>
                  </div>
                  <div>
                    <span className="product-banner__info-label">Tình trạng</span>
                    <span className={`product-banner__info-stock ${product.stock === 0 ? 'out' : ''}`}>
                      {product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
                    </span>
                  </div>
                </div>

                <div className="product-banner__info-actions">
                  <button
                    className={`btn-primary ${addedId === product.id ? 'added' : ''}`}
                    onClick={e => handleAddToCart(e, product)}
                    disabled={adding === product.id || product.stock === 0}
                  >
                    <FiShoppingCart size={17} />
                    {adding === product.id ? 'Đang thêm...' : addedId === product.id ? '✓ Đã thêm!' : 'Thêm vào giỏ'}
                  </button>
                  <Link to={`/products/${product.slug}`} className="btn-secondary">
                    Xem chi tiết
                  </Link>
                </div>

                {/* Slide counter */}
                <div className="product-banner__counter">
                  <span>{String(current + 1).padStart(2, '0')}</span>
                  <div className="product-banner__counter-bar">
                    <div
                      className="product-banner__counter-fill"
                      style={{ width: `${((current + 1) / products.length) * 100}%` }}
                    />
                  </div>
                  <span>{String(products.length).padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            {/* Next Arrow */}
            <button
              className="product-banner__arrow product-banner__arrow--next"
              onClick={() => { next(); resetTimer() }}
              aria-label="Tiếp"
            >
              <FiChevronRight size={22} />
            </button>
          </div>

          {/* Dots */}
          <div className="product-banner__dots">
            {products.map((p, i) => (
              <button
                key={p.id}
                className={`product-banner__dot ${i === current ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="container">
        <div className="product-banner__thumbs">
          {products.map((p, i) => (
            <button
              key={p.id}
              className={`product-banner__thumb ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              title={p.name}
            >
              <img
                src={p.image_url}
                alt={p.name}
                onError={e => { e.target.src = 'https://placehold.co/100x80/F4EFE6/B5722A?text=NTN' }}
              />
              <span>{p.name.slice(0, 20)}{p.name.length > 20 ? '…' : ''}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
