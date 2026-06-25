import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'
import AdminModal from './AdminModal'

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)
const formatDate  = (d) => d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'

const STATUS_OPTIONS = [
  { value: 'pending',    label: '⏳ Chờ xử lý',   color: '#C47A15' },
  { value: 'processing', label: '⚙️ Đang xử lý',  color: '#3B82F6' },
  { value: 'shipped',    label: '🚚 Đang giao',    color: '#8B5CF6' },
  { value: 'delivered',  label: '✅ Đã giao',      color: '#2D8A4E' },
  { value: 'cancelled',  label: '❌ Đã hủy',       color: '#C0392B' },
]

const statusColor = (s) => STATUS_OPTIONS.find(o => o.value === s)?.color || '#9E8060'
const statusLabel = (s) => STATUS_OPTIONS.find(o => o.value === s)?.label || s

function StatusBadge({ status }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
      color: statusColor(status),
      background: `${statusColor(status)}18`,
      whiteSpace: 'nowrap',
    }}>{statusLabel(status)}</span>
  )
}

export default function AdminOrders() {
  const [orders, setOrders]         = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })
  const [statusFilter, setStatus]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [modal, setModal]           = useState(null) // 'detail' | 'status'
  const [newStatus, setNewStatus]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async (page = 1, background = false) => {
    if (!background) setLoading(true)
    try {
      const res = await adminAPI.getOrders({ page, limit: 15, status: statusFilter || undefined })
      setOrders(res.data.data)
      setPagination(res.data.pagination)
    } catch { /* interceptor handles */ }
    finally { if (!background) setLoading(false) }
  }, [statusFilter])

  useEffect(() => {
    load(1, false)
    const interval = setInterval(() => {
      load(pagination?.page || 1, true)
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [load, pagination?.page])

  const openDetail = (o) => {
    setSelected(o)
    setModal('detail')
  }

  const openStatus = (o) => {
    setSelected(o)
    setNewStatus(o.status)
    setModal('status')
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selected.status) { setModal(null); return }
    setSaving(true)
    try {
      await adminAPI.updateOrderStatus(selected.id, newStatus)
      showToast(`Cập nhật trạng thái đơn #${selected.id} thành công!`)
      setModal(null)
      load(pagination.page)
    } catch (err) {
      showToast(err.response?.data?.message || 'Cập nhật thất bại.', 'error')
    } finally { setSaving(false) }
  }

  // Stats
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div>
      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>}

      <div className="admin-page-header">
        <h1>Quản lý Đơn hàng</h1>
        <p>Theo dõi và cập nhật trạng thái tất cả đơn hàng — tổng {pagination.total} đơn</p>
      </div>

      {/* Filter */}
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, padding: '14px 18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9E8060' }}>Lọc theo:</span>
          <button
            className={`admin-page-btn${!statusFilter ? ' active' : ''}`}
            onClick={() => setStatus('')}
          >Tất cả</button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`admin-page-btn${statusFilter === s.value ? ' active' : ''}`}
              onClick={() => setStatus(s.value)}
              style={{ borderColor: statusFilter === s.value ? s.color : undefined }}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã ĐH</th>
                <th>Khách hàng</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}><div className="admin-skeleton" /></td>
                  ))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9E8060' }}>
                  Không có đơn hàng nào
                </td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 800, color: '#B5722A' }}>#{o.id}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{o.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9E8060' }}>{o.user_email}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#9E8060', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.shipping_address?.address ? `${o.shipping_address.address}, ${o.shipping_address.city}` : '—'}
                  </td>
                  <td style={{ fontWeight: 800, color: '#B5722A' }}>{formatPrice(o.total_price)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ fontSize: '0.78rem', color: '#9E8060' }}>{formatDate(o.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-btn-icon admin-btn-icon--edit" title="Xem chi tiết" onClick={() => openDetail(o)}>👁️</button>
                      <button className="admin-btn-icon admin-btn-icon--edit" title="Cập nhật trạng thái" onClick={() => openStatus(o)}>🔄</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <span style={{ color: '#9E8060', fontSize: '0.82rem' }}>{pagination.total} đơn hàng</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`admin-page-btn${p === pagination.page ? ' active' : ''}`} onClick={() => load(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Detail */}
      {modal === 'detail' && selected && (
        <AdminModal title={`Chi tiết đơn hàng #${selected.id}`} onClose={() => setModal(null)} size="lg">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Khách hàng', value: selected.user_name },
              { label: 'Email', value: selected.user_email },
              { label: 'Người nhận', value: selected.shipping_address?.full_name || '—' },
              { label: 'Điện thoại', value: selected.shipping_address?.phone || '—' },
              { label: 'Địa chỉ', value: `${selected.shipping_address?.address || ''}, ${selected.shipping_address?.city || ''}` },
              { label: 'Ngày đặt', value: formatDate(selected.created_at) },
              { label: 'Trạng thái', value: statusLabel(selected.status) },
              { label: 'Tổng tiền', value: formatPrice(selected.total_price) },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9E8060', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A0F00' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {selected.shipping_address?.note && (
            <div style={{ padding: '10px 14px', background: 'rgba(181,114,42,0.06)', borderRadius: 8, marginBottom: 18, fontSize: '0.85rem', color: '#4A3520' }}>
              📝 <strong>Ghi chú:</strong> {selected.shipping_address.note}
            </div>
          )}

          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.85rem' }}>Sản phẩm đã đặt</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(selected.items || []).map(item => (
              <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: 'rgba(181,114,42,0.04)', borderRadius: 10 }}>
                <img src={item.image_url} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://placehold.co/44x44/F4EFE6/B5722A?text=NTN' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9E8060' }}>x{item.quantity} × {formatPrice(item.unit_price)}</div>
                </div>
                <div style={{ fontWeight: 800, color: '#B5722A' }}>{formatPrice(item.unit_price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={() => setModal(null)}>Đóng</button>
            <button className="btn-primary" onClick={() => { setModal(null); setTimeout(() => openStatus(selected), 50) }} style={{ padding: '10px 22px' }}>
              🔄 Cập nhật trạng thái
            </button>
          </div>
        </AdminModal>
      )}

      {/* Modal: Update status */}
      {modal === 'status' && selected && (
        <AdminModal title={`Cập nhật trạng thái — Đơn #${selected.id}`} onClose={() => setModal(null)} size="sm">
          <p style={{ marginBottom: 16, color: '#4A3520', fontSize: '0.875rem' }}>
            Trạng thái hiện tại: <StatusBadge status={selected.status} />
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {STATUS_OPTIONS.map(s => (
              <label key={s.value} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                border: `2px solid ${newStatus === s.value ? s.color : 'rgba(181,114,42,0.12)'}`,
                borderRadius: 10, cursor: 'pointer',
                background: newStatus === s.value ? `${s.color}10` : 'transparent',
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="status" value={s.value} checked={newStatus === s.value} onChange={() => setNewStatus(s.value)} style={{ accentColor: s.color }} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: s.color }}>{s.label}</span>
              </label>
            ))}
          </div>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn-primary" onClick={handleUpdateStatus} disabled={saving || newStatus === selected.status} style={{ padding: '10px 24px' }}>
              {saving ? 'Đang cập nhật...' : 'Lưu trạng thái'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
