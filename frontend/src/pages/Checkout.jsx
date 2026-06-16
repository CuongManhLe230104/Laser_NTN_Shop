import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiShoppingBag } from 'react-icons/fi'
import { cartAPI, orderAPI } from '../services/api'
import './Checkout.css'

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵', desc: 'Trả tiền mặt khi nhận hàng' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Chuyển khoản trước, shop xác nhận trong 30 phút' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [cart, setCart]         = useState({ items: [], total: 0 })
  const [cartLoading, setCartLoading] = useState(true)
  const [step, setStep]         = useState(1) // 1: Thông tin | 2: Xem lại | 3: Xác nhận
  const [payment, setPayment]   = useState('cod')
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId]   = useState(null)
  const [error, setError]       = useState(null)

  const [form, setForm] = useState({
    full_name:  user.name || '',
    phone:      '',
    address:    '',
    city:       '',
    note:       '',
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    cartAPI.getCart()
      .then(r => setCart(r.data.data))
      .catch(() => setError('Không thể tải giỏ hàng.'))
      .finally(() => setCartLoading(false))
  }, [])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFormErrors(fe => ({ ...fe, [e.target.name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim())  errs.full_name  = 'Vui lòng nhập họ tên.'
    if (!form.phone.trim())      errs.phone      = 'Vui lòng nhập số điện thoại.'
    if (!/^0\d{9}$/.test(form.phone.trim())) errs.phone = 'Số điện thoại không hợp lệ (VD: 0912345678).'
    if (!form.address.trim())    errs.address    = 'Vui lòng nhập địa chỉ.'
    if (!form.city.trim())       errs.city       = 'Vui lòng nhập tỉnh/thành phố.'
    return errs
  }

  const handleNext = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await orderAPI.create({
        shipping_address: {
          full_name: form.full_name,
          phone:     form.phone,
          address:   form.address,
          city:      form.city,
        },
        note:           form.note,
        payment_method: payment,
      })
      setOrderId(res.data.data.orderId)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.')
      setStep(1)
    } finally {
      setSubmitting(false)
    }
  }

  if (cartLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  if (cart.items.length === 0 && step !== 3) return (
    <div className="checkout-page">
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <FiShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: 20 }} />
        <h2 style={{ fontFamily: 'Outfit', marginBottom: 8 }}>Giỏ hàng trống</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Vui lòng thêm sản phẩm trước khi thanh toán.</p>
        <Link to="/products" className="btn-primary">Mua sắm ngay <FiArrowRight size={18} /></Link>
      </div>
    </div>
  )

  /* ---- Step 3: Success ---- */
  if (step === 3) return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-success glass-card">
          <div className="checkout-success__icon">
            <FiCheckCircle size={64} color="#2D8A4E" />
          </div>
          <h1 className="checkout-success__title">Đặt hàng thành công! 🎉</h1>
          <p className="checkout-success__subtitle">
            Cảm ơn bạn đã tin tưởng Laser NTN Shop.<br />
            Đơn hàng <strong>#{orderId}</strong> của bạn đang được xử lý.
          </p>
          <div className="checkout-success__info">
            <div>
              <span>Phương thức thanh toán</span>
              <strong>{PAYMENT_METHODS.find(p => p.id === payment)?.label}</strong>
            </div>
            <div>
              <span>Giao hàng đến</span>
              <strong>{form.address}, {form.city}</strong>
            </div>
            {payment === 'bank' && (
              <div className="checkout-bank-info">
                <p>📋 <strong>Thông tin chuyển khoản:</strong></p>
                <p>Ngân hàng: <strong>Vietcombank</strong></p>
                <p>Số TK: <strong>1234567890</strong></p>
                <p>Chủ TK: <strong>NGUYEN THI NTN</strong></p>
                <p>Nội dung: <strong>DH{orderId} - {form.full_name}</strong></p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
            <Link to="/orders" className="btn-primary">Xem đơn hàng của tôi <FiArrowRight size={18} /></Link>
            <Link to="/products" className="btn-secondary">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Steps indicator */}
        <div className="checkout-steps">
          {['Thông tin', 'Xem lại', 'Hoàn tất'].map((label, i) => (
            <div key={i} className={`checkout-step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="checkout-step__circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

        <div className="checkout-layout">
          {/* LEFT — Main content */}
          <div className="checkout-main">
            {step === 1 && (
              <>
                {/* Shipping form */}
                <div className="checkout-card">
                  <h2 className="checkout-card__title">📦 Thông tin giao hàng</h2>
                  <div className="checkout-form-grid">
                    <div className={`checkout-form-group ${formErrors.full_name ? 'has-error' : ''}`}>
                      <label>Họ và tên *</label>
                      <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                      {formErrors.full_name && <span className="field-error">{formErrors.full_name}</span>}
                    </div>
                    <div className={`checkout-form-group ${formErrors.phone ? 'has-error' : ''}`}>
                      <label>Số điện thoại *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="0912345678" inputMode="numeric" />
                      {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                    </div>
                    <div className={`checkout-form-group checkout-form-group--full ${formErrors.address ? 'has-error' : ''}`}>
                      <label>Địa chỉ (số nhà, đường, phường/xã) *</label>
                      <input name="address" value={form.address} onChange={handleChange} placeholder="123 Đường Lê Lợi, Phường Bến Nghé" />
                      {formErrors.address && <span className="field-error">{formErrors.address}</span>}
                    </div>
                    <div className={`checkout-form-group ${formErrors.city ? 'has-error' : ''}`}>
                      <label>Tỉnh / Thành phố *</label>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="TP. Hồ Chí Minh" />
                      {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                    </div>
                    <div className="checkout-form-group">
                      <label>Ghi chú đơn hàng</label>
                      <input name="note" value={form.note} onChange={handleChange} placeholder="Giao giờ hành chính, gọi trước 30 phút..." />
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="checkout-card">
                  <h2 className="checkout-card__title">💳 Phương thức thanh toán</h2>
                  <div className="payment-options">
                    {PAYMENT_METHODS.map(m => (
                      <label key={m.id} className={`payment-option ${payment === m.id ? 'selected' : ''}`}>
                        <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} />
                        <span className="payment-option__icon">{m.icon}</span>
                        <div>
                          <strong>{m.label}</strong>
                          <span>{m.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="btn-primary checkout-action-btn" onClick={handleNext}>
                  Tiếp tục xem lại đơn hàng <FiArrowRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="checkout-card">
                  <h2 className="checkout-card__title">🛍 Sản phẩm đặt mua</h2>
                  <div className="checkout-item-list">
                    {cart.items.map(item => (
                      <div key={item.id} className="checkout-item">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          onError={e => { e.target.src = 'https://placehold.co/56x56/F4EFE6/B5722A?text=NTN' }}
                        />
                        <div className="checkout-item__info">
                          <span className="checkout-item__name">{item.name}</span>
                          <span className="checkout-item__qty">x{item.quantity}</span>
                        </div>
                        <span className="checkout-item__price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="checkout-card">
                  <h2 className="checkout-card__title">📦 Địa chỉ giao hàng</h2>
                  <div className="checkout-review-info">
                    <div><label>Người nhận</label><span>{form.full_name}</span></div>
                    <div><label>Điện thoại</label><span>{form.phone}</span></div>
                    <div><label>Địa chỉ</label><span>{form.address}, {form.city}</span></div>
                    {form.note && <div><label>Ghi chú</label><span>{form.note}</span></div>}
                    <div><label>Thanh toán</label><span>{PAYMENT_METHODS.find(p => p.id === payment)?.label}</span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                    <FiArrowLeft size={16} /> Sửa thông tin
                  </button>
                  <button className="btn-primary checkout-action-btn" onClick={handleSubmit} disabled={submitting} style={{ flex: 2 }}>
                    {submitting ? 'Đang xử lý...' : <>Xác nhận đặt hàng <FiArrowRight size={18} /></>}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Order summary */}
          <div className="checkout-summary glass-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="checkout-summary__items">
              {cart.items.map(item => (
                <div key={item.id} className="checkout-summary__item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Phí vận chuyển</span>
              <span style={{ color: '#2D8A4E', fontWeight: 700 }}>Miễn phí</span>
            </div>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__total">
              <span>Tổng cộng</span>
              <span className="gradient-text">{formatPrice(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
