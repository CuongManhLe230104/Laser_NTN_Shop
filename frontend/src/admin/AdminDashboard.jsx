import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

/* ---- Helpers ---- */
const formatPrice = (v) => {
  if (!v && v !== 0) return '0₫'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M₫`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K₫`
  return `${v}₫`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

/* ---- Loading skeleton ---- */
const Skeleton = ({ w = '100%', h = 24, radius = 6 }) => (
  <div style={{
    width: w, height: h, borderRadius: radius,
    background: 'linear-gradient(90deg, #F4EFE6 25%, #EDE4D0 50%, #F4EFE6 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
)

/* ---- Status pill for stock ---- */
const StockBadge = ({ stock }) => {
  if (stock === 0)  return <span className="status-pill status-pill--error">Hết hàng</span>
  if (stock <= 5)   return <span className="status-pill status-pill--warning">Sắp hết ({stock})</span>
  return <span className="status-pill status-pill--success">Còn hàng ({stock})</span>
}

/* ---- Quick actions (static links, always visible) ---- */
const quickActions = [
  { label: 'Thêm sản phẩm mới', desc: 'Tạo sản phẩm handmade mới', icon: '🪵', bg: 'rgba(181,114,42,0.12)', link: '/admin/products/new' },
  { label: 'Quản lý danh mục',  desc: 'Thêm, sửa, xóa danh mục',  icon: '📂', bg: 'rgba(59,130,246,0.1)',  link: '/admin/categories' },
  { label: 'Quản lý sản phẩm', desc: 'Xem toàn bộ sản phẩm',     icon: '📦', bg: 'rgba(196,122,21,0.1)',  link: '/admin/products' },
  { label: 'Quản lý người dùng', desc: 'Xem danh sách khách hàng', icon: '👤', bg: 'rgba(45,138,78,0.1)',  link: '/admin/users' },
]

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = (background = false) => {
      if (!background) setLoading(true)
      adminAPI.getStats()
        .then(res => setData(res.data.data))
        .catch(err => {
          console.error(err)
          setError(err.response?.data?.message || 'Không thể tải dữ liệu thống kê.')
        })
        .finally(() => {
          if (!background) setLoading(false)
        })
    }

    fetchStats(false)
    const interval = setInterval(() => fetchStats(true), 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const s = data?.stats || {}
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <>
      {/* Shimmer keyframe (inject once) */}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Page Header */}
      <div className="admin-page-header">
        <h1>Xin chào, {user.name || 'Admin'} 👋</h1>
        <p>Bảng điều khiển Laser NTN Shop — dữ liệu cập nhật theo thời gian thực</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ---- Stat Cards ---- */}
      <div className="admin-stats-grid">
        {/* Sản phẩm */}
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--amber">🪵</div>
            {!loading && s.outOfStock > 0 && (
              <span className="admin-stat-card__change admin-stat-card__change--down">
                {s.outOfStock} hết hàng
              </span>
            )}
          </div>
          <div>
            <div className="admin-stat-card__value">
              {loading ? <Skeleton w={60} h={36} /> : s.activeProducts ?? '—'}
            </div>
            <div className="admin-stat-card__label">Sản phẩm đang bán</div>
            {!loading && (
              <div style={{ fontSize: '0.72rem', color: '#9E8060', marginTop: 4 }}>
                Tổng: {s.totalProducts} sản phẩm
              </div>
            )}
          </div>
        </div>

        {/* Người dùng */}
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--blue">👤</div>
          </div>
          <div>
            <div className="admin-stat-card__value">
              {loading ? <Skeleton w={60} h={36} /> : s.totalUsers ?? '—'}
            </div>
            <div className="admin-stat-card__label">Khách hàng đã đăng ký</div>
          </div>
        </div>

        {/* Danh mục */}
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--green">📂</div>
          </div>
          <div>
            <div className="admin-stat-card__value">
              {loading ? <Skeleton w={60} h={36} /> : s.totalCategories ?? '—'}
            </div>
            <div className="admin-stat-card__label">Danh mục sản phẩm</div>
          </div>
        </div>

        {/* Giá trị kho */}
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--red">₫</div>
          </div>
          <div>
            <div className="admin-stat-card__value" style={{ fontSize: '1.6rem' }}>
              {loading ? <Skeleton w={90} h={36} /> : formatPrice(s.inventoryValue)}
            </div>
            <div className="admin-stat-card__label">Giá trị hàng tồn kho</div>
          </div>
        </div>
      </div>

      {/* ---- Content Grid ---- */}
      <div className="admin-content-grid">

        {/* Sản phẩm mới nhất */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Sản phẩm mới nhất</span>
            <a className="admin-card__action" href="/admin/products">Xem tất cả →</a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Kho</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j}><Skeleton h={18} /></td>
                      ))}
                    </tr>
                  ))
                ) : data?.recentProducts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#9E8060', padding: '28px' }}>
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                ) : data?.recentProducts?.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-thumb">
                        <img
                          src={p.image_url || ''}
                          alt={p.name}
                          onError={e => { e.target.src = 'https://placehold.co/38x38/F4EFE6/B5722A?text=NTN' }}
                        />
                        <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#9E8060', fontSize: '0.8rem' }}>{p.category_name || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#B5722A' }}>{formatPrice(p.price)}</td>
                    <td><StockBadge stock={p.stock} /></td>
                    <td style={{ color: '#9E8060', fontSize: '0.8rem' }}>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Thao tác nhanh */}
          <div className="admin-card">
            <div className="admin-card__header">
              <span className="admin-card__title">Thao tác nhanh</span>
            </div>
            <div className="admin-card__body">
              {quickActions.map((a) => (
                <a key={a.label} href={a.link} className="admin-quick-action">
                  <div className="admin-quick-action__icon" style={{ background: a.bg }}>{a.icon}</div>
                  <div className="admin-quick-action__text">
                    <strong>{a.label}</strong>
                    <span>{a.desc}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Sản phẩm sắp hết hàng */}
          {(loading || (data?.lowStockProducts?.length > 0)) && (
            <div className="admin-card">
              <div className="admin-card__header">
                <span className="admin-card__title">⚠️ Sắp hết hàng</span>
              </div>
              <div className="admin-card__body" style={{ padding: '10px 22px' }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ marginBottom: 10 }}><Skeleton h={18} /></div>
                  ))
                ) : data?.lowStockProducts?.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0', borderBottom: '1px solid rgba(181,114,42,0.07)',
                  }}>
                    <img
                      src={p.image_url || ''}
                      alt={p.name}
                      style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://placehold.co/32x32/F4EFE6/B5722A?text=NTN' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9E8060' }}>{p.category_name}</div>
                    </div>
                    <span className="status-pill status-pill--warning">{p.stock} còn</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danh mục nhanh */}
          {!loading && data?.categoriesWithCount?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card__header">
                <span className="admin-card__title">Danh mục & Sản phẩm</span>
              </div>
              <div className="admin-card__body" style={{ padding: '10px 22px' }}>
                {data.categoriesWithCount.map(cat => (
                  <div key={cat.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0', borderBottom: '1px solid rgba(181,114,42,0.07)',
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat.name}</span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, color: '#B5722A',
                      background: 'rgba(181,114,42,0.1)', padding: '3px 10px', borderRadius: 999,
                    }}>
                      {cat.product_count} SP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Khách hàng mới nhất */}
      {!loading && data?.recentUsers?.length > 0 && (
        <div className="admin-card" style={{ marginTop: 18 }}>
          <div className="admin-card__header">
            <span className="admin-card__title">Khách hàng đăng ký gần đây</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u, idx) => (
                  <tr key={u.id}>
                    <td style={{ color: '#9E8060', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: '#9E8060', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ color: '#9E8060', fontSize: '0.8rem' }}>{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
