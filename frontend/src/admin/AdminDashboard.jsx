import { useEffect, useState } from 'react'
import { productAPI } from '../services/api'

/* Stat Card Data */
const statsConfig = [
  {
    key: 'revenue',
    label: 'Doanh thu tháng',
    icon: '₫',
    colorClass: 'amber',
    change: '+12.4%',
    dir: 'up',
    format: (v) => `${(v / 1_000_000).toFixed(1)}M₫`,
  },
  {
    key: 'orders',
    label: 'Đơn hàng mới',
    icon: '📦',
    colorClass: 'blue',
    change: '+8.1%',
    dir: 'up',
    format: (v) => v,
  },
  {
    key: 'products',
    label: 'Sản phẩm',
    icon: '🪵',
    colorClass: 'green',
    change: '+3',
    dir: 'up',
    format: (v) => v,
  },
  {
    key: 'users',
    label: 'Khách hàng',
    icon: '👤',
    colorClass: 'red',
    change: '+21.7%',
    dir: 'up',
    format: (v) => v,
  },
]

/* Fake orders table data */
const fakeOrders = [
  { id: '#0042', customer: 'Nguyễn Văn A', product: 'Hộp rượu gỗ cao cấp', img: '/hop-ruou.png', total: '350.000₫', status: 'delivered', date: '03/06/2026' },
  { id: '#0041', customer: 'Trần Thị B',   product: 'Khay lịch gỗ để bàn',  img: '/khay-lich.png', total: '180.000₫', status: 'processing', date: '02/06/2026' },
  { id: '#0040', customer: 'Lê Văn C',     product: 'Hộp bút gỗ khắc chữ',  img: '/hop-but.png',  total: '95.000₫',  status: 'pending', date: '01/06/2026' },
  { id: '#0039', customer: 'Phạm Thị D',   product: 'Móc khóa gỗ khắc tên', img: '/moc-khoa.png', total: '35.000₫',  status: 'delivered', date: '01/06/2026' },
  { id: '#0038', customer: 'Hoàng Văn E',  product: 'Hộp rượu gỗ cao cấp',  img: '/hop-ruou.png', total: '700.000₫', status: 'cancelled', date: '31/05/2026' },
]

const statusLabel = {
  delivered:  { label: 'Hoàn thành', cls: 'success' },
  processing: { label: 'Đang xử lý', cls: 'warning' },
  pending:    { label: 'Chờ xác nhận', cls: 'warning' },
  cancelled:  { label: 'Đã hủy',    cls: 'error'   },
}

/* Quick actions */
const quickActions = [
  { label: 'Thêm sản phẩm mới', desc: 'Tạo sản phẩm handmade mới', icon: '🪵', bg: 'rgba(181,114,42,0.12)', link: '/admin/products/new' },
  { label: 'Quản lý danh mục',  desc: 'Thêm, sửa, xóa danh mục',  icon: '📂', bg: 'rgba(59,130,246,0.1)',  link: '/admin/categories' },
  { label: 'Xem đơn hàng mới',  desc: '3 đơn đang chờ xác nhận',  icon: '📦', bg: 'rgba(196,122,21,0.1)',  link: '/admin/orders' },
  { label: 'Xuất báo cáo',      desc: 'Báo cáo tháng 06/2026',    icon: '📊', bg: 'rgba(45,138,78,0.1)',   link: '/admin/analytics' },
]

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0)

  useEffect(() => {
    productAPI.getAll({ limit: 1 }).then(res => {
      setProductCount(res.data?.pagination?.total || 0)
    }).catch(() => {})
  }, [])

  const statsValues = {
    revenue: 4850000,
    orders: 42,
    products: productCount,
    users: 156,
  }

  return (
    <>
      {/* Page Header */}
      <div className="admin-page-header">
        <h1>Xin chào, Admin 👋</h1>
        <p>Chào mừng trở lại bảng điều khiển Laser NTN Shop</p>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {statsConfig.map((s) => (
          <div key={s.key} className="admin-stat-card">
            <div className="admin-stat-card__header">
              <div className={`admin-stat-card__icon admin-stat-card__icon--${s.colorClass}`}>
                {s.icon}
              </div>
              <span className={`admin-stat-card__change admin-stat-card__change--${s.dir}`}>
                {s.change}
              </span>
            </div>
            <div>
              <div className="admin-stat-card__value">{s.format(statsValues[s.key])}</div>
              <div className="admin-stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="admin-content-grid">
        {/* Recent orders table */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Đơn hàng gần đây</span>
            <a className="admin-card__action" href="/admin/orders">Xem tất cả →</a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {fakeOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: '#B5722A' }}>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>
                      <div className="admin-product-thumb">
                        <img
                          src={o.img}
                          alt={o.product}
                          onError={e => { e.target.src = 'https://placehold.co/38x38/F4EFE6/B5722A?text=NTN' }}
                        />
                        <span>{o.product}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.total}</td>
                    <td>
                      <span className={`status-pill status-pill--${statusLabel[o.status].cls}`}>
                        {statusLabel[o.status].label}
                      </span>
                    </td>
                    <td style={{ color: '#9E8060' }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Thao tác nhanh</span>
          </div>
          <div className="admin-card__body">
            {quickActions.map((a) => (
              <a key={a.label} href={a.link} className="admin-quick-action">
                <div className="admin-quick-action__icon" style={{ background: a.bg }}>
                  {a.icon}
                </div>
                <div className="admin-quick-action__text">
                  <strong>{a.label}</strong>
                  <span>{a.desc}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
