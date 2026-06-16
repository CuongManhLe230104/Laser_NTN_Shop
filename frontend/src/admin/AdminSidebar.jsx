import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

/* SVG Icons (inline — no lib required) */
const Icon = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Products: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>
    </svg>
  ),
  Categories: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Orders: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
}

const navItems = [
  {
    section: 'Tổng quan',
    items: [
      { label: 'Dashboard', icon: Icon.Dashboard, path: '/admin', badge: null },
    ],
  },
  {
    section: 'Quản lý',
    items: [
      {label: 'Sản phẩm', icon: Icon.Products, path: '/admin/products', badge: '8'},
      {label: 'Danh mục', icon: Icon.Categories, path: '/admin/categories', badge: null},
      {label: 'Đơn hàng', icon: Icon.Orders, path: '/admin/orders', badge: '3'},
      {label: 'Người dùng', icon: Icon.Users, path: '/admin/users', badge: null},
      {label: 'Tin nhắn', icon: Icon.Chat, path: '/admin/chat', badge: null},
    ],
  },
  {
    section: 'Hệ thống',
    items: [
      { label: 'Thống kê', icon: Icon.Analytics, path: '/admin/analytics', badge: null },
      { label: 'Cài đặt', icon: Icon.Settings, path: '/admin/settings', badge: null },
    ],
  },
]

export default function AdminSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Brand */}
      <div className="sidebar__brand">
        <img src="/logo.jpg" alt="Laser NTN" className="sidebar__brand-logo" />
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">Laser NTN</span>
          <span className="sidebar__brand-sub">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="sidebar__section-label">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                data-tooltip={item.label}
                className={({ isActive }) =>
                  `sidebar__nav-item${isActive ? ' active' : ''}`
                }
                onClick={onCloseMobile}
              >
                <span className="sidebar__nav-icon"><item.icon /></span>
                <span className="sidebar__nav-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar__nav-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer — User info & logout */}
      <div className="sidebar__footer">
        <div className="sidebar__nav-item" style={{ marginBottom: 0 }}
          title={collapsed ? user.name : undefined}>
          <span className="sidebar__nav-icon">
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'linear-gradient(135deg, #B5722A, #D4943A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.6rem', fontWeight: 700
            }}>
              {(user.name || 'A')[0].toUpperCase()}
            </div>
          </span>
          <span className="sidebar__nav-label" style={{ flex: 1, overflow: 'hidden' }}>
            <strong style={{ display: 'block', color: 'white', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'Admin'}
            </strong>
            <span style={{ color: '#B5722A', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {user.role || 'admin'}
            </span>
          </span>
        </div>

        <button
          className="sidebar__nav-item"
          style={{ marginBottom: 0, marginTop: 2 }}
          data-tooltip="Đăng xuất"
          onClick={handleLogout}
        >
          <span className="sidebar__nav-icon" style={{ color: '#C0392B' }}><Icon.Logout /></span>
          <span className="sidebar__nav-label" style={{ color: '#C0392B' }}>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
