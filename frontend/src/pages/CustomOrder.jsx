import { FiPhone, FiMail, FiMapPin, FiFacebook, FiSend, FiCheckCircle } from 'react-icons/fi';
import './CustomOrder.css';

export default function CustomOrder() {
  const shopPhone = '0986814523';
  const shopEmail = 'laserntn2019@gmail.com';
  const shopFacebook = 'https://www.facebook.com/HandmadeShopNTN68';
  const mapLink = 'https://www.google.com/maps/place/Laser+NTN/@10.8099088,106.7848644,17z/data=!4m14!1m7!3m6!1s0x31752b8c9dd357e1:0xc75bc2474f1be888!2sLaser+NTN!8m2!3d10.8099035!4d106.7874393!16s%2Fg%2F11hd_hb9qc!3m5!1s0x31752b8c9dd357e1:0xc75bc2474f1be888!8m2!3d10.8099035!4d106.7874393!16s%2Fg%2F11hd_hb9qc?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D';

  return (
    <div className="custom-order-page">
      {/* Banner */}
      <section className="custom-order-banner">
        <div className="container">
          <h1 className="gradient-text">Đặt Hàng Thiết Kế Riêng & Số Lượng Lớn</h1>
          <p>Hiện thực hóa ý tưởng của bạn trên gỗ tự nhiên với công nghệ khắc laser tinh xảo hàng đầu</p>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="action-section container" style={{ marginTop: '40px' }}>
        <div className="action-grid">
          
          {/* Left Column: Guidelines & Services info */}
          <div className="direct-contact-container">
            {/* Service 1 */}
            <div className="service-card glass-card" style={{ marginBottom: '24px' }}>
              <div className="service-card__icon">🎨</div>
              <h3>Thiết Kế Riêng Theo Yêu Cầu</h3>
              <p>
                Cá nhân hóa các sản phẩm gỗ handmade như móc khóa, sổ tay, khay lịch, tranh gỗ... 
                Chúng tôi nhận khắc laser tên, chữ ký, chân dung vẽ tay, hoặc thiết kế độc quyền 
                chỉ từ 1 sản phẩm. Thích hợp làm quà tặng sinh nhật, kỷ niệm độc đáo.
              </p>
              <ul className="service-card__bullets">
                <li>Khắc laser chân dung & hình ảnh sắc nét</li>
                <li>Tự do chọn font chữ, vị trí khắc theo ý muốn</li>
                <li>Đội ngũ thiết kế hỗ trợ chỉnh sửa hình ảnh miễn phí</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="service-card glass-card" style={{ marginBottom: '24px' }}>
              <div className="service-card__icon">📦</div>
              <h3>Đặt Hàng Sỉ & Số Lượng Lớn</h3>
              <p>
                Sản xuất hộp gỗ đựng quà tết, hộp rượu, hộp trà, menu gỗ, bảng hiệu doanh nghiệp số lượng lớn. 
                Mức chiết khấu sỉ cực tốt cho các công ty quà tặng, đơn vị sự kiện, nhà hàng, quán cafe. 
                Cam kết thời gian bàn giao đúng hạn và hỗ trợ làm mẫu thực tế.
              </p>
              <ul className="service-card__bullets">
                <li>Chiết khấu cao theo số lượng đặt hàng</li>
                <li>Khắc logo thương hiệu định vị doanh nghiệp</li>
                <li>Sản xuất nhanh, bàn giao toàn quốc</li>
              </ul>
            </div>

            {/* Workflow Steps */}
            <div className="quick-info-box glass-card">
              <div className="workflow-diagram">
                <h4>Quy trình đặt hàng tùy chỉnh:</h4>
                <div className="workflow-steps">
                  <div className="step-item">
                    <span className="step-number">1</span>
                    <div className="step-text">
                      <h5>Gửi yêu cầu thiết kế</h5>
                      <p>Gửi ý tưởng, kích thước & số lượng qua Zalo, Live Chat hoặc gọi Hotline trực tiếp.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-number">2</span>
                    <div className="step-text">
                      <h5>Nhận thiết kế mẫu & Báo giá</h5>
                      <p>Shop lên bản vẽ 2D/3D gửi bạn duyệt và gửi bảng báo giá chi tiết trong vòng 10-15 phút.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-number">3</span>
                    <div className="step-text">
                      <h5>Sản xuất & Giao hàng</h5>
                      <p>Tiến hành khắc mẫu thực tế, gia công hàng loạt và giao tận nơi toàn quốc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Contact Details */}
          <div className="direct-contact-container">
            <div className="quick-info-box glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>⚡ Liên Hệ Trực Tiếp Với Admin</h3>
                <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
                  Không cần đăng ký tài khoản phức tạp! Quý khách chỉ cần liên hệ trực tiếp với chúng tôi qua các kênh dưới đây để nhận tư vấn, thiết kế mẫu và báo giá nhanh chóng nhất.
                </p>
              </div>
              
              <div className="contact-methods-list" style={{ flex: 1 }}>
                {/* Zalo */}
                <a 
                  href={`https://zalo.me/${shopPhone}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="direct-contact-item zalo-item"
                  style={{ padding: '20px' }}
                >
                  <div className="direct-icon" style={{ width: '48px', height: '48px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
                  </div>
                  <div className="direct-text">
                    <h4 style={{ fontSize: '1rem' }}>Chat Zalo Hỗ Trợ Ngay</h4>
                    <p style={{ fontSize: '0.85rem' }}>Số điện thoại: {shopPhone} (Phản hồi sau 5 phút)</p>
                  </div>
                </a>

                {/* Hotline */}
                <a 
                  href={`tel:${shopPhone}`} 
                  className="direct-contact-item phone-item"
                  style={{ padding: '20px' }}
                >
                  <div className="direct-icon" style={{ width: '48px', height: '48px' }}>
                    <FiPhone size={22} />
                  </div>
                  <div className="direct-text">
                    <h4 style={{ fontSize: '1rem' }}>Hotline Gọi Điện Trực Tiếp</h4>
                    <p style={{ fontSize: '0.85rem' }}>Số điện thoại: {shopPhone} (Hỗ trợ 24/7)</p>
                  </div>
                </a>

                {/* Facebook */}
                <a 
                  href={shopFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="direct-contact-item"
                  style={{ padding: '20px', background: 'rgba(59, 89, 152, 0.04)', borderColor: 'rgba(59, 89, 152, 0.15)' }}
                >
                  <div className="direct-icon" style={{ width: '48px', height: '48px', color: '#3b5998' }}>
                    <FiFacebook size={22} />
                  </div>
                  <div className="direct-text">
                    <h4 style={{ fontSize: '1rem' }}>Facebook Fanpage</h4>
                    <p style={{ fontSize: '0.85rem' }}>Nhắn tin qua trang Handmade Shop NTN</p>
                  </div>
                </a>

                {/* Email */}
                <div 
                  className="direct-contact-item"
                  style={{ padding: '20px', background: 'rgba(231, 76, 60, 0.04)', borderColor: 'rgba(231, 76, 60, 0.15)', cursor: 'default' }}
                >
                  <div className="direct-icon" style={{ width: '48px', height: '48px', color: '#e74c3c' }}>
                    <FiMail size={22} />
                  </div>
                  <div className="direct-text">
                    <h4 style={{ fontSize: '1rem' }}>Địa Chỉ Email</h4>
                    <p style={{ fontSize: '0.85rem' }}>Gửi thư: {shopEmail}</p>
                  </div>
                </div>

                {/* Address */}
                <a 
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="direct-contact-item"
                  style={{ padding: '20px', background: 'rgba(46, 204, 113, 0.04)', borderColor: 'rgba(46, 204, 113, 0.15)' }}
                >
                  <div className="direct-icon" style={{ width: '48px', height: '48px', color: '#2ecc71' }}>
                    <FiMapPin size={22} />
                  </div>
                  <div className="direct-text">
                    <h4 style={{ fontSize: '1rem' }}>Địa Chỉ Cửa Hàng</h4>
                    <p style={{ fontSize: '0.85rem' }}>Laser NTN, TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </a>
              </div>

              {/* Quick tip box */}
              <div style={{
                background: 'rgba(181, 114, 42, 0.06)',
                border: '1.5px dashed rgba(181, 114, 42, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                color: '#8f5519',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                💬 Hoặc bạn cũng có thể mở bong bóng chat ở góc dưới bên phải màn hình để trao đổi trực tiếp với Admin ngay tại website (chỉ cần đăng nhập).
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
