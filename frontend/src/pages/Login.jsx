import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import { authAPI } from '../services/api'
import './Login.css'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let res
      if (mode === 'login') {
        res = await authAPI.login({ email: form.email, password: form.password })
      } else {
        res = await authAPI.register(form)
      }

      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Background orbs */}
      <div className="login-page__orb login-page__orb--1" />
      <div className="login-page__orb login-page__orb--2" />

      <div className="login-card glass-card">
        {/* Logo */}
        <div className="login-card__logo">
          <img src="/logo.jpg" alt="Laser NTN" className="login-card__logo-img" />
        </div>

        {/* Tabs */}
        <div className="login-card__tabs">
          <button
            id="tab-login"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(null) }}
          >
            Đăng Nhập
          </button>
          <button
            id="tab-register"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(null) }}
          >
            Đăng Ký
          </button>
        </div>

        <h1 className="login-card__title">
          {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
        </h1>
        <p className="login-card__sub">
          {mode === 'login'
            ? 'Đăng nhập để tiếp tục mua sắm'
            : 'Tham gia cùng hàng nghìn khách hàng của chúng tôi'}
        </p>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Form */}
        <form className="login-card__form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="login-card__field">
              <label htmlFor="name">Họ và tên</label>
              <div className="login-card__input-wrap">
                <FiUser className="login-card__input-icon" size={16} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="login-card__field">
            <label htmlFor="email">Email</label>
            <div className="login-card__input-wrap">
              <FiMail className="login-card__input-icon" size={16} />
              <input
                id="email"
                name="email"
                type="email"
                className="input-field"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="login-card__field">
            <label htmlFor="password">Mật khẩu</label>
            <div className="login-card__input-wrap">
              <FiLock className="login-card__input-icon" size={16} />
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="login-card__eye"
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="submit-auth"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px' }}
          >
            {loading
              ? 'Đang xử lý...'
              : mode === 'login'
              ? 'Đăng Nhập'
              : 'Đăng Ký Ngay'}
          </button>
        </form>

        <p className="login-card__footer">
          {mode === 'login' ? (
            <>Chưa có tài khoản? <button onClick={() => setMode('register')}>Đăng ký</button></>
          ) : (
            <>Đã có tài khoản? <button onClick={() => setMode('login')}>Đăng nhập</button></>
          )}
        </p>

        <div className="login-card__back">
          <Link to="/">← Quay về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
