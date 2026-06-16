import { useState, useEffect, useCallback } from 'react'
import { adminAPI, productAPI, categoryAPI } from '../services/api'
import AdminModal from './AdminModal'

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)
const formatDate  = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '',
  stock: '', image_url: '', category_id: '', is_active: true,
  extra_images: '',
}

export default function AdminProducts() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 })
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected]     = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState(null)
  const [toast, setToast]           = useState(null)
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingExtra, setUploadingExtra] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await adminAPI.getProducts({ page, limit: 15, search: search || undefined, category: catFilter || undefined })
      setProducts(res.data.data)
      setPagination(res.data.pagination)
    } catch { /* handled by api interceptor */ }
    finally { setLoading(false) }
  }, [search, catFilter])

  useEffect(() => { loadProducts(1) }, [loadProducts])

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setFormError(null); setModal('add') }
  const openEdit = (p) => {
    setSelected(p)
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      price: p.price, stock: p.stock, image_url: p.image_url || '',
      category_id: p.category_id, is_active: p.is_active,
      extra_images: p.extra_images || '',
    })
    setFormError(null)
    setModal('edit')
  }
  const openDelete = (p) => { setSelected(p); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setFormError(null)
  }

  const handleMainImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingMain(true)
    setFormError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await adminAPI.uploadSingle(formData)
      if (res.data && res.data.url) {
        setForm(f => ({ ...f, image_url: res.data.url }))
        showToast('Tải ảnh chính lên thành công!')
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Không thể tải ảnh chính lên.')
    } finally {
      setUploadingMain(false)
    }
  }

  const handleExtraImagesFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (files.length > 5) {
      setFormError('Chỉ có thể tải lên tối đa 5 hình ảnh chi tiết một lần.')
      return
    }

    setUploadingExtra(true)
    setFormError(null)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    try {
      const res = await adminAPI.uploadMultiple(formData)
      if (res.data && res.data.urls) {
        const newUrls = res.data.urls
        setForm(f => {
          const currentUrls = f.extra_images ? f.extra_images.split(',').map(x => x.trim()).filter(Boolean) : []
          const combined = [...currentUrls, ...newUrls].join(', ')
          return { ...f, extra_images: combined }
        })
        showToast(`Đã tải lên ${newUrls.length} hình ảnh chi tiết thành công!`)
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Không thể tải các ảnh chi tiết lên.')
    } finally {
      setUploadingExtra(false)
    }
  }

  const handleRemoveExtraImage = (indexToRemove) => {
    setForm(f => {
      const currentUrls = f.extra_images ? f.extra_images.split(',').map(x => x.trim()).filter(Boolean) : []
      const updated = currentUrls.filter((_, i) => i !== indexToRemove).join(', ')
      return { ...f, extra_images: updated }
    })
  }

  const handleSave = async () => {
    if (!form.name || !form.category_id || form.price === '' || form.stock === '') {
      setFormError('Vui lòng điền đầy đủ: tên, danh mục, giá và số lượng.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        is_active: form.is_active,
      }
      if (modal === 'add') {
        await productAPI.create(payload)
        showToast('Thêm sản phẩm thành công!')
      } else {
        await productAPI.update(selected.id, payload)
        showToast('Cập nhật sản phẩm thành công!')
      }
      closeModal()
      loadProducts(pagination.page)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productAPI.delete(selected.id)
      showToast('Đã xóa sản phẩm thành công!', 'success')
      closeModal()
      loadProducts(1)
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại.', 'error')
      closeModal()
    } finally { setSaving(false) }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Quản lý Sản phẩm</h1>
          <p>Thêm, sửa, xóa sản phẩm handmade của shop</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ flexShrink: 0, padding: '10px 22px', fontSize: '0.875rem' }}>
          + Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, padding: '14px 18px', flexWrap: 'wrap' }}>
          <input
            className="admin-filter-input"
            placeholder="🔍 Tìm kiếm tên sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            className="admin-filter-input"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Kho</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}><div className="admin-skeleton" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9E8060' }}>
                  Không tìm thấy sản phẩm nào
                </td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-thumb">
                      <img src={p.image_url || ''} alt={p.name}
                        onError={e => { e.target.src = 'https://placehold.co/38x38/F4EFE6/B5722A?text=NTN' }} />
                      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#9E8060', fontSize: '0.82rem' }}>{p.category_name || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#B5722A' }}>{formatPrice(p.price)}</td>
                  <td>
                    {p.stock === 0
                      ? <span className="status-pill status-pill--error">Hết hàng</span>
                      : p.stock <= 5
                        ? <span className="status-pill status-pill--warning">Còn {p.stock}</span>
                        : <span style={{ fontWeight: 600 }}>{p.stock}</span>
                    }
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${p.is_active ? 'success' : 'error'}`}>
                      {p.is_active ? 'Đang bán' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ color: '#9E8060', fontSize: '0.8rem' }}>{formatDate(p.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="admin-btn-icon admin-btn-icon--edit" onClick={() => openEdit(p)} title="Sửa">✏️</button>
                      <button className="admin-btn-icon admin-btn-icon--delete" onClick={() => openDelete(p)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <span style={{ color: '#9E8060', fontSize: '0.82rem' }}>
              {pagination.total} sản phẩm
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`admin-page-btn${p === pagination.page ? ' active' : ''}`}
                  onClick={() => loadProducts(p)}
                >{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <AdminModal
          title={modal === 'add' ? 'Thêm sản phẩm mới' : `Sửa: ${selected?.name}`}
          onClose={closeModal}
          size="lg"
        >
          {formError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{formError}</div>}
          <div className="admin-form-grid">
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tên sản phẩm *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Hộp rượu gỗ cao cấp..." className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label>Danh mục *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="admin-form-input">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Slug (URL)</label>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="hop-ruou-go-cao-cap" className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label>Giá bán (₫) *</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="350000" className="admin-form-input" />
            </div>
            <div className="admin-form-group">
              <label>Số lượng kho *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="50" className="admin-form-input" />
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Hình ảnh chính *</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="Đường dẫn URL ảnh hoặc chọn file từ máy..." className="admin-form-input" style={{ flex: 1 }} />
                <label className="btn-secondary" style={{ flexShrink: 0, cursor: 'pointer', padding: '10px 16px', margin: 0, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  📁 Chọn file
                  <input type="file" accept="image/*" onChange={handleMainImageFileChange} style={{ display: 'none' }} />
                </label>
              </div>
              {uploadingMain && <span style={{ fontSize: '0.8rem', color: '#B5722A', display: 'block', marginTop: 4 }}>⏳ Đang tải ảnh lên...</span>}
              {form.image_url && (
                <div style={{ marginTop: 8 }}>
                  <img src={form.image_url} alt="Main Preview" style={{ maxHeight: 80, borderRadius: 6, border: '1px solid #E4EFE6' }} onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=Loi+anh' }} />
                </div>
              )}
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Ảnh chi tiết bổ sung (mỗi ảnh cách nhau bởi dấu phẩy hoặc chọn nhiều file)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input name="extra_images" value={form.extra_images} onChange={handleChange} placeholder="Ví dụ: /den-ngu-1.jpg, /den-ngu-2.jpg" className="admin-form-input" style={{ flex: 1 }} />
                <label className="btn-secondary" style={{ flexShrink: 0, cursor: 'pointer', padding: '10px 16px', margin: 0, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  📁 Chọn nhiều file
                  <input type="file" accept="image/*" multiple onChange={handleExtraImagesFileChange} style={{ display: 'none' }} />
                </label>
              </div>
              {uploadingExtra && <span style={{ fontSize: '0.8rem', color: '#B5722A', display: 'block', marginTop: 4 }}>⏳ Đang tải các ảnh lên...</span>}
              {form.extra_images && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {form.extra_images.split(',').map((img, i) => img.trim() && (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img.trim()} alt={`Extra Preview ${i}`} style={{ maxHeight: 60, borderRadius: 6, border: '1px solid #E4EFE6' }} onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=Loi+anh' }} />
                      <button type="button" onClick={() => handleRemoveExtraImage(i)} style={{ position: 'absolute', top: -5, right: -5, background: '#C0392B', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mô tả sản phẩm</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Mô tả chi tiết về sản phẩm..." className="admin-form-input" style={{ resize: 'vertical' }} />
            </div>
            <div className="admin-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} style={{ width: 16, height: 16, accentColor: '#B5722A' }} />
                Đang bán (hiển thị trên web)
              </label>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={closeModal} disabled={saving}>Hủy</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 28px' }}>
              {saving ? 'Đang lưu...' : modal === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
            </button>
          </div>
        </AdminModal>
      )}

      {/* Modal: Delete confirm */}
      {modal === 'delete' && (
        <AdminModal title="Xác nhận xóa sản phẩm" onClose={closeModal} size="sm">
          <p style={{ marginBottom: 20, color: '#4A3520' }}>
            Bạn có chắc muốn xóa sản phẩm <strong>"{selected?.name}"</strong>?<br />
            <span style={{ fontSize: '0.85rem', color: '#C0392B' }}>Hành động này không thể hoàn tác.</span>
          </p>
          <div className="admin-modal-actions">
            <button className="btn-secondary" onClick={closeModal} disabled={saving}>Hủy</button>
            <button className="btn-primary" style={{ background: '#C0392B', padding: '10px 24px' }} onClick={handleDelete} disabled={saving}>
              {saving ? 'Đang xóa...' : 'Xóa sản phẩm'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
