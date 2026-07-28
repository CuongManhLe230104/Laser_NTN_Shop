import { createContext, useContext, useState, useCallback } from 'react'

// ─── 1. Tạo Context ──────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── 2. Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Khởi tạo từ localStorage (nếu đã đăng nhập từ lần trước)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Gọi sau khi đăng nhập thành công
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  // Gọi khi đăng xuất
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    token,
    user,
    isLoggedIn: !!token,
    isAdmin: !!token && user?.role === 'admin',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── 3. Custom Hook ───────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth() phải được dùng bên trong <AuthProvider>')
  }
  return ctx
}
