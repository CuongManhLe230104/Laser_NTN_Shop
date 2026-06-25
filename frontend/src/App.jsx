import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import CustomOrder from './pages/CustomOrder'
import ChatWidget from './components/ChatWidget'
import ProductDetail from './pages/ProductDetail'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminProducts from './admin/AdminProducts'
import AdminCategories from './admin/AdminCategories'
import AdminUsers from './admin/AdminUsers'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminOrders from './admin/AdminOrders'
import AdminSettings from './admin/AdminSettings'
import AdminChat from './admin/AdminChat'

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

// Helper: wrap a component in AdminRoute + AdminLayout
const AdminPage = ({ children }) => (
  <AdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </AdminRoute>
)

// Helper: user page (Navbar + Footer + ProtectedRoute + ChatWidget)
const UserPage = ({ children, protect = false }) => {
  const content = (
    <>
      <Navbar />
      <main className="page-wrapper">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  )
  return protect ? <ProtectedRoute>{content}</ProtectedRoute> : content
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Public / User routes ---- */}
        <Route path="/"         element={<UserPage><Home /></UserPage>} />
        <Route path="/products" element={<UserPage><Products /></UserPage>} />
        <Route path="/products/:slug" element={<UserPage><ProductDetail /></UserPage>} />
        <Route path="/login"    element={<UserPage><Login /></UserPage>} />
        <Route path="/cart"     element={<UserPage protect><Cart /></UserPage>} />
        <Route path="/checkout"     element={<UserPage protect><Checkout /></UserPage>} />
        <Route path="/orders"       element={<UserPage protect><Orders /></UserPage>} />
        <Route path="/custom-order" element={<UserPage><CustomOrder /></UserPage>} />

        {/* ---- Admin routes ---- */}
        <Route path="/admin"            element={<AdminPage><AdminDashboard /></AdminPage>} />
        <Route path="/admin/products"   element={<AdminPage><AdminProducts /></AdminPage>} />
        <Route path="/admin/categories" element={<AdminPage><AdminCategories /></AdminPage>} />
        <Route path="/admin/users"      element={<AdminPage><AdminUsers /></AdminPage>} />
        <Route path="/admin/analytics"  element={<AdminPage><AdminAnalytics /></AdminPage>} />
        <Route path="/admin/orders"     element={<AdminPage><AdminOrders /></AdminPage>} />
        <Route path="/admin/settings"   element={<AdminPage><AdminSettings /></AdminPage>} />
        <Route path="/admin/chat"       element={<AdminPage><AdminChat /></AdminPage>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
