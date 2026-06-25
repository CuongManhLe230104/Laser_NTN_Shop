import { Link } from 'react-router-dom'
import { FiArrowRight, FiZap, FiShield, FiTruck, FiStar } from 'react-icons/fi'
import ProductBanner from '../components/ProductBanner'
import './Home.css'

const features = [
  {
    icon: <FiStar size={28} />,
    title: 'Chế tác tỉ mỉ',
    desc: 'Mỗi sản phẩm đều được gia công thủ công và khắc laser chính xác, đạt độ hoàn thiện cao nhất.',
  },
  {
    icon: <FiZap size={28} />,
    title: 'Khắc theo yêu cầu',
    desc: 'Hỗ trợ thiết kế, khắc tên, số điện thoại, logo hoặc thông điệp riêng biệt hoàn toàn miễn phí.',
  },
  {
    icon: <FiShield size={28} />,
    title: 'Gỗ chất lượng cao',
    desc: 'Sử dụng các loại gỗ tự nhiên và MDF chống ẩm cao cấp, đảm bảo tính thẩm mỹ và độ bền lâu dài.',
  },
  {
    icon: <FiTruck size={28} />,
    title: 'Đóng gói cẩn thận',
    desc: 'Bảo quản sản phẩm kỹ càng trong hộp chuyên dụng, giao tận nơi nhanh chóng toàn quốc.',
  },
]

const stats = [
  { value: '1.000+', label: 'Sản phẩm hoàn thành' },
  { value: '500+', label: 'Khách hàng tin dùng' },
  { value: '99%', label: 'Đánh giá 5 sao' },
  { value: '24/7', label: 'Tư vấn & Thiết kế' },
]

export default function Home() {
  return (
    <div className="home">
      {/* Product Banner — ĐẦU TRANG */}
      <ProductBanner />

      {/* Hero Section */}
      <section className="hero">
        {/* Background orbs */}
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />

        <div className="container hero__content">
          <div className="hero__text fade-in-up">
            <span className="badge" style={{ marginBottom: '20px', display: 'inline-block' }}>
              ✨ Quà tặng gỗ khắc laser tinh xảo
            </span>
            <h1 className="hero__title">
              Quà Tặng Gỗ{' '}
              <span className="gradient-text">Handmade</span>
              {' '}Độc Bản
            </h1>
            <p className="hero__desc">
              Laser NTN Shop — Đơn vị chuyên thiết kế và chế tác các sản phẩm quà tặng gỗ handmade độc đáo: hộp rượu, khay lịch, hộp bút, đèn ngủ gỗ... Khắc tên & logo miễn phí theo yêu cầu.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn-primary hero__cta">
                Khám Phá Ngay <FiArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-secondary">
                Tìm Hiểu Thêm
              </a>
            </div>
          </div>

          {/* Logo Visual Column */}
          <div className="hero__visual fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="hero__logo-container">
              <div className="hero__logo-ring hero__logo-ring--1" />
              <div className="hero__logo-ring hero__logo-ring--2" />
              <img src="/logo.jpg" alt="Laser NTN Shop" className="hero__logo-image" />
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="stats">
        <div className="container stats__grid">
          {stats.map((stat, i) => (
            <div key={i} className="stats__item glass-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <div className="features__header">
            <h2 className="section-title">
              Tại Sao Chọn <span className="gradient-text">Laser NTN?</span>
            </h2>
            <p className="section-subtitle">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với sản phẩm chất lượng cao.
            </p>
          </div>

          <div className="features__grid">
            {features.map((f, i) => (
              <div key={i} className="features__card glass-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="features__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
