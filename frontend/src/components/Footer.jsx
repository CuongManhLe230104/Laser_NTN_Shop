import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiYoutube } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  const currentYear = 2019

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
            Chuyên cung cấp các sản phẩm handmade, quà tặng độc đáo, giá rẻ và nhiều mặt hàng hấp dẫn khác.
          </p>
          <div className="footer__socials">
            <a href="https://www.facebook.com/HandmadeShopNTN68" aria-label="Facebook"><FiFacebook size={18} /></a>
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
            <li><FiPhone size={14} />0986814523</li>
            <li><FiMail size={14} /> laserntn2019@gmail.com</li>
            <li><a href="https://www.google.com/maps/place/Laser+NTN/@10.8099088,106.7848644,17z/data=!4m14!1m7!3m6!1s0x31752b8c9dd357e1:0xc75bc2474f1be888!2sLaser+NTN!8m2!3d10.8099035!4d106.7874393!16s%2Fg%2F11hd_hb9qc!3m5!1s0x31752b8c9dd357e1:0xc75bc2474f1be888!8m2!3d10.8099035!4d106.7874393!16s%2Fg%2F11hd_hb9qc?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D"><FiMapPin size={14} /> Laser NTN, Ho Chi Minh City, Vietnam, 700000</a></li>
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
