import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import Login from './pages/Login'
import Cart from './pages/Cart'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'

// Protected route — redirect to /login if not logged in
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

// Admin route — must be logged in AND have admin role
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Public / User routes (with Navbar + Footer) ---- */}
        <Route path="/" element={<><Navbar /><main className="page-wrapper"><Home /></main><Footer /></>} />
        <Route path="/products" element={<><Navbar /><main className="page-wrapper"><Products /></main><Footer /></>} />
        <Route path="/login" element={<><Navbar /><main className="page-wrapper"><Login /></main><Footer /></>} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <><Navbar /><main className="page-wrapper"><Cart /></main><Footer /></>
          </ProtectedRoute>
        } />

        {/* ---- Admin routes (AdminLayout — no Navbar/Footer) ---- */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout>
              <div style={{ padding: '40px', textAlign: 'center', color: '#9E8060' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', marginBottom: 8 }}>Trang đang xây dựng 🚧</h2>
                <p>Chức năng này sẽ sớm được ra mắt.</p>
              </div>
            </AdminLayout>
          </AdminRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
