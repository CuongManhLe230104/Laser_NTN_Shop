import { useState, useEffect } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import '../admin/admin.css'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev)
    } else {
      setCollapsed(prev => !prev)
    }
  }

  const handleCloseMobile = () => {
    if (isMobile) setMobileOpen(false)
  }

  return (
    <div className="admin-shell">
      {/* Overlay (mobile) */}
      {isMobile && mobileOpen && (
        <div
          className="admin-overlay visible"
          onClick={handleCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        collapsed={!isMobile && collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* Topbar */}
      <AdminTopbar
        collapsed={!isMobile && collapsed}
        onToggleCollapse={handleToggle}
      />

      {/* Main Content */}
      <main className={`admin-main${(!isMobile && collapsed) ? ' collapsed-sidebar' : ''}`}>
        {children}
      </main>
    </div>
  )
}
