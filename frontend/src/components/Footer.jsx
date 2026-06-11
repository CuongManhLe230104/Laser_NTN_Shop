import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiYoutube } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo.jpg" alt="Laser NTN" className="footer__logo-img" />
            <div className="footer__logo-text">
              <span>Laser<strong>NTN</strong></span>
              <small>Thiết Kế · Gia Công · Laser</small>
            </div>
          </div>
          <p className="footer__tagline">
            Chuyên cung cấp máy laser, phụ kiện và vật liệu laser chất lượng cao, chính hãng tại Việt Nam.
          </p>
          <div className="footer__socials">
            <a href="#" aria-label="Facebook"><FiFacebook size={18} /></a>
            <a href="#" aria-label="YouTube"><FiYoutube size={18} /></a>
          </div>
        </div>

        {/* Navigation */}
        <div className="footer__col">
          <h4>Sản Phẩm</h4>
          <ul>
            <li><Link to="/products?category=may-laser">Máy Laser</Link></li>
            <li><Link to="/products?category=phu-kien">Phụ Kiện</Link></li>
            <li><Link to="/products?category=vat-lieu">Vật Liệu</Link></li>
            <li><Link to="/products?category=bao-ho">Bảo Hộ</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer__col">
          <h4>Hỗ Trợ</h4>
          <ul>
            <li><Link to="/login">Đăng Nhập</Link></li>
            <li><Link to="/cart">Giỏ Hàng</Link></li>
            <li><a href="#">Chính Sách Bảo Hành</a></li>
            <li><a href="#">Hướng Dẫn Sử Dụng</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4>Liên Hệ</h4>
          <ul>
            <li><FiPhone size={14} /> 0123 456 789</li>
            <li><FiMail size={14} /> info@laserntn.vn</li>
            <li><FiMapPin size={14} /> TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container">
          <p>© {currentYear} Laser NTN Shop. Tất cả quyền được bảo lưu.</p>
          <p>Made with ❤️ in Vietnam</p>
        </div>
      </div>
    </footer>
  )
}
