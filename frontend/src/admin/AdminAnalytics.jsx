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
  const [aiReport, setAiReport] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const handleRunAIAnalysis = async () => {
    setAiLoading(true)
    setAiError('')
    try {
      const res = await adminAPI.getReviewsAIAnalysis()
      if (res.data && res.data.success) {
        setAiReport(res.data.data)
      } else {
        setAiError(res.data?.message || 'Không thể tạo báo cáo phân tích AI.')
      }
    } catch (err) {
      console.error('Error running AI review analysis:', err)
      setAiError(err.response?.data?.message || 'Lỗi hệ thống khi gọi phân tích AI. Vui lòng kiểm tra lại cấu hình API key.')
    } finally {
      setAiLoading(false)
    }
  }

  // Custom Markdown parser inside the component
  const renderMarkdown = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    const listItems = []
    const renderedElements = []

    const flushList = (key) => {
      if (listItems.length > 0) {
        renderedElements.push(
          <ul key={`list-${key}`} style={{ margin: '12px 0 12px 24px', paddingLeft: 0, listStyleType: 'disc' }}>
            {listItems.map((item, idx) => (
              <li key={idx} style={{ color: '#4A3520', marginBottom: '6px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        )
        listItems.length = 0
      }
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) {
        flushList(index)
        renderedElements.push(<div key={`space-${index}`} style={{ height: '8px' }} />)
        return
      }

      // Process bold text and escapes
      let parsedLine = trimmed
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1A0F00; font-weight: 700;">$1</strong>')

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList(index)
        renderedElements.push(
          <h3 key={index} style={{ color: '#4A3520', marginTop: '18px', marginBottom: '8px', fontSize: '1.05rem', borderBottom: '1px dashed rgba(181,114,42,0.2)', paddingBottom: '4px', fontWeight: '700' }}>
            {trimmed.replace('### ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('## ')) {
        flushList(index)
        renderedElements.push(
          <h2 key={index} style={{ color: '#4A3520', marginTop: '24px', marginBottom: '12px', fontSize: '1.2rem', borderBottom: '1px solid rgba(181,114,42,0.3)', paddingBottom: '6px', fontWeight: '700' }}>
            {trimmed.replace('## ', '')}
          </h2>
        )
      } else if (trimmed.startsWith('# ')) {
        flushList(index)
        renderedElements.push(
          <h1 key={index} style={{ color: '#4A3520', marginTop: '28px', marginBottom: '16px', fontSize: '1.4rem', fontWeight: '800' }}>
            {trimmed.replace('# ', '')}
          </h1>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = parsedLine.substring(2)
        listItems.push(itemText)
      } else {
        flushList(index)
        renderedElements.push(
          <p key={index} style={{ color: '#4A3520', lineHeight: '1.6', margin: '8px 0' }} dangerouslySetInnerHTML={{ __html: parsedLine }} />
        )
      }
    })

    flushList('final')
    return renderedElements
  }

  useEffect(() => {
    const fetchStats = (background = false) => {
      if (!background) setLoading(true)
      adminAPI.getStats()
        .then(res => setData(res.data.data))
        .catch(() => {})
        .finally(() => {
          if (!background) setLoading(false)
        })
    }

    fetchStats(false)
    const interval = setInterval(() => fetchStats(true), 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
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
            <div className="admin-stat-card__value" style={{ fontSize: '1.5rem' }}>{formatPrice(s.revenue)}</div>
            <div className="admin-stat-card__label">Tổng doanh thu</div>
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

      {/* AI Analysis Row */}
      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span className="admin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🤖</span> AI Phân Tích Ý Kiến & Nhu Cầu Khách Hàng
          </span>
          <button 
            className="admin-btn admin-btn--primary" 
            onClick={handleRunAIAnalysis}
            disabled={aiLoading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: '#B5722A',
              color: '#FFF',
              border: 'none',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(181, 114, 42, 0.2)'
            }}
          >
            {aiLoading ? (
              <>
                <span className="admin-spinner" style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'admin-spin 1s linear infinite'
                }} />
                Đang phân tích dữ liệu...
              </>
            ) : 'Chạy Phân Tích AI'}
          </button>
        </div>
        <div className="admin-card__body" style={{ minHeight: 180, padding: '22px' }}>
          {aiError && (
            <div style={{ 
              color: '#C0392B', 
              background: 'rgba(192, 57, 43, 0.08)', 
              padding: '14px 18px', 
              borderRadius: 8, 
              marginBottom: 18, 
              fontSize: '0.85rem',
              border: '1px solid rgba(192, 57, 43, 0.2)',
              fontWeight: 500
            }}>
              {aiError}
            </div>
          )}
          
          {aiReport ? (
            <div className="ai-report-content" style={{ 
              background: '#FAF7F2', 
              border: '1px solid rgba(181, 114, 42, 0.15)', 
              borderRadius: 10, 
              padding: '24px', 
              fontSize: '0.9rem',
              color: '#4A3520',
              boxShadow: 'inset 0 1px 4px rgba(90, 50, 10, 0.03)'
            }}>
              {renderMarkdown(aiReport)}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '50px 20px', 
              color: '#9E8060',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3rem', marginBottom: 16 }}>📈</span>
              <h3 style={{ fontSize: '1.05rem', color: '#4A3520', margin: '0 0 8px 0', fontWeight: 700 }}>Chưa có báo cáo phân tích</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', maxWidth: 480, lineHeight: 1.5 }}>
                Nhấn nút <strong>"Chạy Phân Tích AI"</strong> để kích hoạt trợ lý AI tổng hợp toàn bộ đánh giá của khách hàng, tính toán điểm hài lòng trung bình, dự báo xu hướng nhu cầu mua sắm và đề xuất cải tiến cho cửa hàng của bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
