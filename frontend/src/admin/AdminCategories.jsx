import { useState, useEffect, useCallback } from 'react'
import { categoryAPI } from '../services/api'
import AdminModal from './AdminModal'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const EMPTY_FORM = { name: '', slug: '', description: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected]     = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState(null)
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryAPI.getAll()
      setCategories(res.data.data || [])
    } catch { /* handled by interceptor */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(null); setModal('add') }
  const openEdit = (c) => {
    setSelected(c)
    setForm({ name: c.name, slug: c.slug, description: c.description || '' })
    setFormError(null)
    setModal('edit')
  }
  const openDelete = (c) => { setSelected(c); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFormError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Tên danh mục là bắt buộc.'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (modal === 'add') {
        await categoryAPI.create(form)
        showToast('Tạo danh mục thành công!')
      } else {
        await categoryAPI.update(selected.id, form)
        showToast('Cập nhật danh mục thành công!')
      }
      closeModal()
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Đã xảy ra lỗi.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (selected.product_count > 0) {
      showToast(`Không thể xóa — danh mục này còn ${selected.product_count} sản phẩm.`, 'error')
      closeModal(); return
    }
    setSaving(true)
    try {
      await categoryAPI.delete(selected.id)
      showToast('Đã xóa danh mục!')
      closeModal(); load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại.', 'error')
      closeModal()
    } finally { setSaving(false) }
  }

  return (
    <div>
      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>}

      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Quản lý Danh mục</h1>
          <p>Tổ chức và phân loại sản phẩm theo danh mục</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ flexShrink: 0, padding: '10px 22px', fontSize: '0.875rem' }}>
          + Thêm danh mục
        </button>
      </div>

      {/* Stats mini */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="admin-stat-card" style={{ flex: 1, minWidth: 180, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <div className="admin-stat-card__icon admin-stat-card__icon--amber">📂</div>
          <div>
            <div className="admin-stat-card__value">{categories.length}</div>
            <div className="admin-stat-card__label">Tổng danh mục</div>
          </div>
        </div>
        <div className="admin-stat-card" style={{ flex: 1, minWidth: 180, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <div className="admin-stat-card__icon admin-stat-card__icon--green">🪵</div>
          <div>
            <div className="admin-stat-card__value">{categories.reduce((s, c) => s + (c.product_count || 0), 0)}</div>
            <div className="admin-stat-card__label">Tổng sản phẩm</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Mô tả</th>
                <th>Số SP</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}><div className="admin-skeleton" /></td>
                  ))}</tr>
                ))
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9E8060' }}>Chưa có danh mục nào</td></tr>
              ) : categories.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ color: '#9E8060', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>
                    <code style={{ background: 'rgba(181,114,42,0.08)', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem', color: '#B5722A' }}>
                      {c.slug}
                    </code>
                  </td>
                  <td style={{ color: '#9E8060', fontSize: '0.85rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.description || '—'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#B5722A' }}>{c.product_count || 0}</span>
                  </td>
                  <td style={{ color: '#9E8060', fontSize: '0.8rem' }}>{formatDate(c.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-btn-icon admin-btn-icon--edit" onClick={() => openEdit(c)}>✏️</button>
                      <button className="admin-btn-icon admin-btn-icon--delete" onClick={() => openDelete(c)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <AdminModal title={modal === 'add' ? 'Thêm danh mục mới' : `Sửa: ${selected?.name}`} onClose={closeModal}>
          {formError && <div className="alert alert-error" style={{ marginBottom: 14 }}>{formError}</div>}
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label>Tên danh mục *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Hộp đựng rượu" className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label>Slug (URL) <span style={{ color: '#9E8060', fontSize: '0.75rem' }}>— để trống để tự tạo</span></label>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="hop-dung-ruou" className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label>Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Mô tả ngắn về danh mục..." className="admin-form-input" style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={closeModal} disabled={saving}>Hủy</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 28px' }}>
              {saving ? 'Đang lưu...' : modal === 'add' ? 'Tạo danh mục' : 'Lưu thay đổi'}
            </button>
          </div>
        </AdminModal>
      )}

      {/* Modal Delete */}
      {modal === 'delete' && (
        <AdminModal title="Xác nhận xóa danh mục" onClose={closeModal} size="sm">
          <p style={{ marginBottom: 20, color: '#4A3520' }}>
            Bạn có chắc muốn xóa danh mục <strong>"{selected?.name}"</strong>?
            {selected?.product_count > 0 && (
              <><br /><span style={{ color: '#C0392B', fontSize: '0.85rem' }}>
                ⚠️ Danh mục này có {selected.product_count} sản phẩm — không thể xóa.
              </span></>
            )}
          </p>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={closeModal}>Hủy</button>
            <button
              className="btn-primary"
              style={{ background: selected?.product_count > 0 ? '#9E8060' : '#C0392B', padding: '10px 24px' }}
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? 'Đang xóa...' : 'Xóa danh mục'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
