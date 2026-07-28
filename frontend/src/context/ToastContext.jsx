import { createContext, useContext, useState, useCallback } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'
import '../styles/context/Toast.css'

// ─── 1. Tạo Context ──────────────────────────────────────────────────────────
const ToastContext = createContext(null)

// ─── 2. Provider ─────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const value = {
    showToast,
    removeToast,
    toastSuccess: (msg) => showToast(msg, 'success'),
    toastError: (msg) => showToast(msg, 'error'),
    toastInfo: (msg) => showToast(msg, 'info'),
    toastWarning: (msg) => showToast(msg, 'warning'),
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle size={18} />
      case 'error':
      case 'warning':
        return <FiAlertCircle size={18} />
      default:
        return <FiInfo size={18} />
    }
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-item--${t.type}`}>
            <span className="toast-item__icon">{getIcon(t.type)}</span>
            <span className="toast-item__msg">{t.message}</span>
            <button className="toast-item__close" onClick={() => removeToast(t.id)}>
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── 3. Custom Hook ───────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast() phải được sử dụng bên trong <ToastProvider>')
  }
  return ctx
}
