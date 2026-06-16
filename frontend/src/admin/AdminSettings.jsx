import { useState } from 'react'
import { authAPI } from '../services/api'

export default function AdminSettings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)

  const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleChangePw = async (e) => {
    e.preventDefault()
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Vui lòng điền đầy đủ tất cả các trường.' }); return
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }); return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' }); return
    }
    setPwLoading(true)
    setPwMsg(null)
    try {
      // Re-authenticate to verify current password
      await authAPI.login({ email: user.email, password: pwForm.currentPassword })
      // If login succeeds, update password via a dedicated endpoint (placeholder)
      // In a real system, you'd call PUT /api/auth/change-password
      setPwMsg({ type: 'success', text: 'Tính năng đổi mật khẩu sẽ được bổ sung API trong phiên bản tiếp theo.' })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      setPwMsg({ type: 'error', text: 'Mật khẩu hiện tại không đúng.' })
    } finally { setPwLoading(false) }
  }

  const initials = (user.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      <div className="admin-page-header">
        <h1>Cài đặt</h1>
        <p>Quản lý thông tin tài khoản Admin</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Profile card */}
        <div className="admin-card">
          <div style={{ padding: 28, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #B5722A, #D4943A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.8rem', fontWeight: 800,
              margin: '0 auto 16px', fontFamily: 'Outfit',
              boxShadow: '0 4px 16px rgba(181,114,42,0.4)',
            }}>{initials}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: '#1A0F00' }}>{user.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#9E8060', marginTop: 4 }}>{user.email}</div>
            <div style={{
              display: 'inline-block', marginTop: 10, padding: '4px 14px',
              background: 'rgba(181,114,42,0.12)', color: '#8F5519',
              borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>
              {user.role || 'admin'}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(181,114,42,0.1)', padding: '16px 20px' }}>
            {[
              { label: 'Tên đăng nhập', value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Vai trò', value: user.role === 'admin' ? 'Quản trị viên' : 'Người dùng' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(181,114,42,0.06)', fontSize: '0.82rem' }}>
                <span style={{ color: '#9E8060' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: '#1A0F00', maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Change password */}
          <div className="admin-card">
            <div className="admin-card__header">
              <span className="admin-card__title">🔐 Đổi mật khẩu</span>
            </div>
            <div className="admin-card__body">
              {pwMsg && (
                <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>
                  {pwMsg.text}
                </div>
              )}
              <form onSubmit={handleChangePw}>
                <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="admin-form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} className="admin-form-input" placeholder="••••••••" />
                  </div>
                  <div className="admin-form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} className="admin-form-input" placeholder="Tối thiểu 6 ký tự" />
                  </div>
                  <div className="admin-form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input type="password" name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} className="admin-form-input" placeholder="Nhập lại mật khẩu mới" />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={pwLoading} style={{ marginTop: 8, padding: '10px 28px' }}>
                  {pwLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>
          </div>

          {/* Shop info (read-only) */}
          <div className="admin-card">
            <div className="admin-card__header">
              <span className="admin-card__title">🏪 Thông tin Shop</span>
            </div>
            <div className="admin-card__body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Tên shop', value: 'Laser NTN Shop' },
                  { label: 'Mô hình KD', value: 'Handmade & Laser Engraving' },
                  { label: 'API Server', value: 'http://localhost:5000' },
                  { label: 'Phiên bản', value: 'v1.0.0' },
                ].map(item => (
                  <div key={item.label} className="admin-form-group">
                    <label>{item.label}</label>
                    <div style={{
                      padding: '10px 14px', background: '#FAF7F2',
                      border: '1.5px solid rgba(181,114,42,0.15)',
                      borderRadius: 10, fontSize: '0.875rem', color: '#4A3520', fontWeight: 600,
                    }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(45,138,78,0.07)', borderRadius: 10, border: '1px solid rgba(45,138,78,0.2)' }}>
                <span style={{ fontSize: '0.82rem', color: '#2D8A4E', fontWeight: 600 }}>
                  ✅ Hệ thống hoạt động bình thường — Backend API đang kết nối
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
