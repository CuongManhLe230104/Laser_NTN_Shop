import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import '../styles/components/Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <img src="/logo.jpg" alt="Laser NTN" className="navbar__logo-img" />
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Trang Chủ</NavLink></li>
          <li><NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Sản Phẩm</NavLink></li>
          <li><NavLink to="/custom-order" className={({ isActive }) => isActive ? 'active' : ''}>Thiết Kế Riêng</NavLink></li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <>
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''} style={{ fontSize: '0.875rem' }}>Đơn hàng</NavLink>
              <span className="navbar__user">
                <FiUser size={14} /> {user.name}
              </span>
              <Link to="/cart" className="navbar__cart-btn" aria-label="Giỏ hàng">
                <FiShoppingCart size={20} />
                {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
              </Link>
              <button className="navbar__logout" onClick={handleLogout} title="Đăng xuất">
                <FiLogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>
              Đăng Nhập
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="navbar__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mở menu"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Trang Chủ</NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>Sản Phẩm</NavLink>
          <NavLink to="/custom-order" onClick={() => setMenuOpen(false)}>Thiết Kế Riêng</NavLink>
          {user ? (
            <>
              <NavLink to="/cart" onClick={() => setMenuOpen(false)}>Giỏ Hàng</NavLink>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}>Đăng Xuất</button>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Đăng Nhập</NavLink>
          )}
        </div>
      )}
    </nav>
  )
}
