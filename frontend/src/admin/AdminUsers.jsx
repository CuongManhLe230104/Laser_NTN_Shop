import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'
import AdminModal from './AdminModal'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const roleBadge = (role) => role === 'admin'
  ? <span className="status-pill" style={{ background: 'rgba(181,114,42,0.15)', color: '#8F5519', fontWeight: 700 }}>Admin</span>
  : <span className="status-pill status-pill--success">User</span>

export default function AdminUsers() {
  const [users, setUsers]           = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // null | 'delete' | 'role'
  const [selected, setSelected]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await adminAPI.getUsers({ page, limit: 15, search: search || undefined })
      setUsers(res.data.data)
      setPagination(res.data.pagination)
    } catch { /* interceptor handles */ }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load(1) }, [load])

  const handleRoleToggle = async () => {
    if (!selected) return
    setSaving(true)
    const newRole = selected.role === 'admin' ? 'user' : 'admin'
    try {
      await adminAPI.updateUserRole(selected.id, newRole)
      showToast(`Đã đổi role của "${selected.name}" thành "${newRole}".`)
      setModal(null)
      load(pagination.page)
    } catch (err) {
      showToast(err.response?.data?.message || 'Cập nhật thất bại.', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await adminAPI.deleteUser(selected.id)
      showToast(`Đã xóa người dùng "${selected.name}".`)
      setModal(null)
      load(1)
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div>
      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>}

      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Quản lý Người dùng</h1>
          <p>Danh sách khách hàng và quản trị viên — tổng {pagination.total} tài khoản</p>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div style={{ padding: '14px 18px' }}>
          <input
            className="admin-filter-input"
            placeholder="🔍 Tìm theo tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: 400 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Ngày đăng ký</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((__, j) => (
                    <td key={j}><div className="admin-skeleton" /></td>
                  ))}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9E8060' }}>Không tìm thấy người dùng</td></tr>
              ) : users.map((u, idx) => {
                const isSelf = u.id === currentUser.id
                return (
                  <tr key={u.id}>
                    <td style={{ color: '#9E8060', fontWeight: 600 }}>
                      {(pagination.page - 1) * 15 + idx + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #B5722A, #D4943A)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {(u.name || 'U')[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>
                          {u.name}
                          {isSelf && <span style={{ fontSize: '0.7rem', color: '#B5722A', marginLeft: 6 }}>(bạn)</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#9E8060', fontSize: '0.85rem' }}>{u.email}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td style={{ color: '#9E8060', fontSize: '0.8rem' }}>{formatDate(u.created_at)}</td>
                    <td>
                      {!isSelf && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="admin-btn-icon admin-btn-icon--edit"
                            title={u.role === 'admin' ? 'Hạ xuống User' : 'Thăng lên Admin'}
                            onClick={() => { setSelected(u); setModal('role') }}
                          >
                            {u.role === 'admin' ? '⬇️' : '⬆️'}
                          </button>
                          <button
                            className="admin-btn-icon admin-btn-icon--delete"
                            title="Xóa tài khoản"
                            onClick={() => { setSelected(u); setModal('delete') }}
                          >🗑️</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <span style={{ color: '#9E8060', fontSize: '0.82rem' }}>{pagination.total} người dùng</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`admin-page-btn${p === pagination.page ? ' active' : ''}`} onClick={() => load(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Role change */}
      {modal === 'role' && selected && (
        <AdminModal title="Thay đổi quyền" onClose={() => setModal(null)} size="sm">
          <p style={{ marginBottom: 20, color: '#4A3520' }}>
            {selected.role === 'admin'
              ? <>Hạ quyền <strong>{selected.name}</strong> từ <strong>Admin</strong> xuống <strong>User</strong>?</>
              : <>Nâng quyền <strong>{selected.name}</strong> từ <strong>User</strong> lên <strong>Admin</strong>?<br />
                <span style={{ fontSize: '0.82rem', color: '#C47A15' }}>⚠️ Admin có toàn quyền quản lý hệ thống.</span>
              </>
            }
          </p>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn-primary" onClick={handleRoleToggle} disabled={saving} style={{ padding: '10px 24px' }}>
              {saving ? 'Đang cập nhật...' : 'Xác nhận'}
            </button>
          </div>
        </AdminModal>
      )}

      {/* Modal: Delete */}
      {modal === 'delete' && selected && (
        <AdminModal title="Xóa tài khoản" onClose={() => setModal(null)} size="sm">
          <p style={{ marginBottom: 20, color: '#4A3520' }}>
            Xóa tài khoản của <strong>{selected.name}</strong> ({selected.email})?<br />
            <span style={{ fontSize: '0.85rem', color: '#C0392B' }}>Giỏ hàng của họ cũng sẽ bị xóa. Hành động không thể hoàn tác.</span>
          </p>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn-primary" style={{ background: '#C0392B', padding: '10px 24px' }} onClick={handleDelete} disabled={saving}>
              {saving ? 'Đang xóa...' : 'Xóa tài khoản'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
