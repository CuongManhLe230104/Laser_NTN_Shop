import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)

/* CSS bar chart — no external libs */
function BarChart({ data, valueKey, labelKey, colorFn }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 120, fontSize: '0.8rem', color: '#4A3520', fontWeight: 600, textAlign: 'right' }}>
            {d[labelKey]}
          </div>
          <div style={{ flex: 1, background: 'rgba(181,114,42,0.08)', borderRadius: 999, height: 20, overflow: 'hidden' }}>
            <div style={{
              width: `${((d[valueKey] || 0) / max) * 100}%`,
              height: '100%',
              background: colorFn ? colorFn(i) : 'linear-gradient(90deg, #B5722A, #D4943A)',
              borderRadius: 999,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: d[valueKey] > 0 ? 8 : 0,
            }} />
          </div>
          <div style={{ minWidth: 60, fontSize: '0.8rem', fontWeight: 700, color: '#B5722A', textAlign: 'right' }}>
            {d[valueKey] || 0}
          </div>
        </div>
      ))}
    </div>
  )
}

/* Donut chart using SVG */
function DonutChart({ segments, size = 140 }) {
  const total = segments.reduce((s, g) => s + (g.value || 0), 0)
  if (total === 0) return <div style={{ textAlign: 'center', color: '#9E8060', padding: 20 }}>Không có dữ liệu</div>

  const colors = ['#B5722A', '#D4943A', '#2D8A4E', '#3B82F6', '#8B5CF6', '#C47A15', '#C0392B']
  const r = 50, cx = size / 2, cy = size / 2, stroke = 18
  let cumAngle = -90

  const arcs = segments.map((s, i) => {
    const angle = (s.value / total) * 360
    const start = cumAngle
    cumAngle += angle
    const startRad = (start * Math.PI) / 180
    const endRad = ((start + angle) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const large = angle > 180 ? 1 : 0
    return { ...s, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: colors[i % colors.length] }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1A0F00">{total}</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="10" fill="#9E8060">tổng</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: a.color, flexShrink: 0 }} />
            <span style={{ color: '#4A3520', flex: 1 }}>{a.label}</span>
            <span style={{ fontWeight: 700, color: a.color }}>{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div>
      <div className="admin-page-header"><h1>Thống kê</h1><p>Đang tải dữ liệu...</p></div>
      <div className="admin-stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-stat-card"><div className="admin-skeleton" style={{ height: 80 }} /></div>
        ))}
      </div>
    </div>
  )

  const s = data?.stats || {}
  const cats = data?.categoriesWithCount || []
  const lowStock = data?.lowStockProducts || []
  const recentProducts = data?.recentProducts || []

  // Category distribution for donut
  const donutData = cats.map(c => ({ label: c.name, value: parseInt(c.product_count) || 0 }))

  // Stock status distribution
  const stockStatus = [
    { label: 'Đang bán (active)', value: s.activeProducts || 0 },
    { label: 'Đã ẩn (inactive)', value: (s.totalProducts || 0) - (s.activeProducts || 0) },
    { label: 'Hết hàng', value: s.outOfStock || 0 },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div className="admin-page-header">
        <h1>Thống kê & Phân tích</h1>
        <p>Tổng quan tình hình kinh doanh Laser NTN Shop</p>
      </div>

      {/* KPIs */}
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--amber">🪵</div>
          </div>
          <div>
            <div className="admin-stat-card__value">{s.totalProducts}</div>
            <div className="admin-stat-card__label">Tổng sản phẩm</div>
            <div style={{ fontSize: '0.72rem', color: '#9E8060', marginTop: 4 }}>
              {s.activeProducts} đang bán · {s.outOfStock} hết hàng
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--blue">👤</div>
          </div>
          <div>
            <div className="admin-stat-card__value">{s.totalUsers}</div>
            <div className="admin-stat-card__label">Khách hàng</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--green">📂</div>
          </div>
          <div>
            <div className="admin-stat-card__value">{s.totalCategories}</div>
            <div className="admin-stat-card__label">Danh mục</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon admin-stat-card__icon--red">₫</div>
          </div>
          <div>
            <div className="admin-stat-card__value" style={{ fontSize: '1.5rem' }}>{formatPrice(s.inventoryValue)}</div>
            <div className="admin-stat-card__label">Giá trị tồn kho</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* SP theo danh mục (bar) */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Sản phẩm theo Danh mục</span>
          </div>
          <div className="admin-card__body">
            {cats.length === 0 ? (
              <p style={{ color: '#9E8060', textAlign: 'center' }}>Chưa có dữ liệu</p>
            ) : (
              <BarChart data={cats} valueKey="product_count" labelKey="name" />
            )}
          </div>
        </div>

        {/* Phân phối trạng thái sản phẩm (donut) */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Phân bổ Danh mục</span>
          </div>
          <div className="admin-card__body">
            <DonutChart segments={donutData} size={150} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Sản phẩm sắp hết */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">⚠️ Cảnh báo tồn kho thấp</span>
          </div>
          <div className="admin-card__body" style={{ padding: '0 22px 18px' }}>
            {lowStock.length === 0 ? (
              <p style={{ color: '#2D8A4E', fontWeight: 600, paddingTop: 12 }}>✅ Tất cả sản phẩm còn đủ hàng</p>
            ) : (
              <table className="admin-table" style={{ marginTop: 0 }}>
                <thead><tr><th>Sản phẩm</th><th>Kho còn</th></tr></thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</td>
                      <td><span className="status-pill status-pill--warning">{p.stock}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sản phẩm mới thêm */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Sản phẩm thêm gần đây</span>
          </div>
          <div className="admin-card__body" style={{ padding: '0 22px 18px' }}>
            <table className="admin-table" style={{ marginTop: 0 }}>
              <thead><tr><th>Tên</th><th>Giá</th><th>Ngày</th></tr></thead>
              <tbody>
                {recentProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                    <td style={{ color: '#B5722A', fontWeight: 700, fontSize: '0.82rem' }}>{formatPrice(p.price)}</td>
                    <td style={{ color: '#9E8060', fontSize: '0.78rem' }}>{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
