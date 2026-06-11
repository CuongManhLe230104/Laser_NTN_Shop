import { useState } from 'react'
import { useLocation } from 'react-router-dom'

/* SVG Icons */
const Icon = {
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Chevron: ({ dir }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(0deg)' : 'rotate(180deg)' }}>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Home: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    </svg>
  ),
  Slash: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16" y1="4" x2="8" y2="20"/>
    </svg>
  ),
}

// Mapping path -> label for breadcrumb
const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/products': 'Sản phẩm',
  '/admin/categories': 'Danh mục',
  '/admin/orders': 'Đơn hàng',
  '/admin/users': 'Người dùng',
  '/admin/analytics': 'Thống kê',
  '/admin/settings': 'Cài đặt',
}

export default function AdminTopbar({ collapsed, onToggleCollapse, onToggleMobile }) {
  const [searchVal, setSearchVal] = useState('')
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const currentPage = breadcrumbMap[location.pathname] || 'Dashboard'
  const initials = (user.name || 'Admin').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className={`admin-topbar${collapsed ? ' collapsed-sidebar' : ''}`}>
      {/* Left */}
      <div className="topbar__left">
        {/* Hamburger / Toggle */}
        <button
          id="admin-sidebar-toggle"
          className="topbar__toggle"
          onClick={onToggleMobile || onToggleCollapse}
          aria-label="Toggle sidebar"
        >
          <Icon.Menu />
        </button>

        {/* Breadcrumb */}
        <nav className="topbar__breadcrumb">
          <Icon.Home />
          <Icon.Slash />
          <span>Admin</span>
          <Icon.Slash />
          <strong>{currentPage}</strong>
        </nav>

        {/* Search */}
        <div className="topbar__search">
          <span className="topbar__search-icon"><Icon.Search /></span>
          <input
            id="admin-search-input"
            type="text"
            className="topbar__search-input"
            placeholder="Tìm kiếm sản phẩm, đơn hàng..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
      </div>

      {/* Right */}
      <div className="topbar__right">
        {/* Dark mode toggle (placeholder) */}
        <button className="topbar__icon-btn" title="Giao diện" aria-label="Toggle theme">
          <Icon.Moon />
        </button>

        {/* Notifications */}
        <button className="topbar__icon-btn" id="admin-notification-btn" title="Thông báo" aria-label="Notifications">
          <Icon.Bell />
          <span className="topbar__notif-dot" />
        </button>

        <div className="topbar__divider" />

        {/* User */}
        <div className="topbar__user" id="admin-user-menu" role="button" tabIndex={0}>
          <div className="topbar__avatar">{initials}</div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">{user.name || 'Admin'}</span>
            <span className="topbar__user-role">{user.role || 'admin'}</span>
          </div>
          <Icon.ChevronDown />
        </div>
      </div>
    </header>
  )
}
