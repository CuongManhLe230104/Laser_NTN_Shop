import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiChevronDown, FiChevronUp, FiXCircle } from 'react-icons/fi'
import { orderAPI } from '../services/api'
import './Orders.css'

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)
const formatDate  = (d) => d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'

const STATUS_CONFIG = {
  pending:    { label: 'Chờ xử lý',   color: '#C47A15', bg: 'rgba(196,122,21,0.1)',   icon: '⏳' },
  processing: { label: 'Đang xử lý',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',   icon: '⚙️' },
  shipped:    { label: 'Đang giao',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',   icon: '🚚' },
  delivered:  { label: 'Đã giao',      color: '#2D8A4E', bg: 'rgba(45,138,78,0.1)',    icon: '✅' },
  cancelled:  { label: 'Đã hủy',      color: '#C0392B', bg: 'rgba(192,57,43,0.1)',    icon: '❌' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#9E8060', bg: 'rgba(158,128,96,0.1)', icon: '❓' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function OrderCard({ order, onCancelled }) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    setCancelling(true)
    try {
      await orderAPI.cancel(order.id)
      onCancelled(order.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đơn thất bại.')
    } finally { setCancelling(false) }
  }

  return (
    <div className="order-card glass-card">
      {/* Header */}
      <div className="order-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="order-card__meta">
          <span className="order-card__id">Đơn hàng #<strong>{order.id}</strong></span>
          <span className="order-card__date">{formatDate(order.created_at)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <StatusBadge status={order.status} />
          <span className="order-card__total gradient-text">{formatPrice(order.total_price)}</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </span>
        </div>
      </div>

      {/* Preview (always visible) */}
      <div className="order-card__preview">
        {order.items.slice(0, 2).map(item => (
          <img
            key={item.product_id}
            src={item.image_url}
            alt={item.name}
            className="order-card__thumb"
            onError={e => { e.target.src = 'https://placehold.co/48x48/F4EFE6/B5722A?text=NTN' }}
          />
        ))}
        {order.items.length > 2 && (
          <span className="order-card__more">+{order.items.length - 2}</span>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>
          {order.items.length} sản phẩm
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="order-card__details">
          <div className="order-items-table">
            <div className="order-items-table__head">
              <span>Sản phẩm</span>
              <span>Đơn giá</span>
              <span>SL</span>
              <span>Thành tiền</span>
            </div>
            {order.items.map(item => (
              <div key={item.product_id} className="order-items-table__row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.src = 'https://placehold.co/40x40/F4EFE6/B5722A?text=NTN' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.name}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatPrice(item.unit_price)}</span>
                <span style={{ fontWeight: 600 }}>x{item.quantity}</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Shipping info */}
          {order.shipping_address && (
            <div className="order-shipping">
              <div className="order-shipping__title">📦 Địa chỉ giao hàng</div>
              <p><strong>{order.shipping_address.full_name}</strong> · {order.shipping_address.phone}</p>
              <p>{order.shipping_address.address}, {order.shipping_address.city}</p>
              {order.shipping_address.note && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{order.shipping_address.note}</p>}
            </div>
          )}

          {/* Cancel button */}
          {order.status === 'pending' && (
            <div style={{ marginTop: 16 }}>
              <button
                className="btn-secondary"
                style={{ color: 'var(--error)', borderColor: 'var(--error)', gap: 6 }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                <FiXCircle size={16} />
                {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    orderAPI.getAll()
      .then(r => setOrders(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancelled = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o))
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 8 }}>
          Đơn hàng <span className="gradient-text">của tôi</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
          Lịch sử và trạng thái tất cả các đơn hàng của bạn
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty glass-card">
            <FiShoppingBag size={64} color="var(--text-muted)" />
            <h2>Chưa có đơn hàng nào</h2>
            <p>Bạn chưa thực hiện đơn hàng nào. Hãy mua sắm ngay!</p>
            <Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} onCancelled={handleCancelled} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
