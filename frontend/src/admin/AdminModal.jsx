import { useEffect, useRef } from 'react'

/**
 * Shared Modal component for Admin pages
 * Usage: <AdminModal title="..." onClose={fn} size="md|lg">...</AdminModal>
 */
export default function AdminModal({ title, onClose, children, size = 'md' }) {
  const overlayRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const widths = { sm: 420, md: 560, lg: 760 }

  return (
    <div
      ref={overlayRef}
      className="amodal-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="amodal-box" style={{ maxWidth: widths[size] }}>
        {/* Header */}
        <div className="amodal-header">
          <h3 className="amodal-title">{title}</h3>
          <button className="amodal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        {/* Body */}
        <div className="amodal-body">{children}</div>
      </div>
    </div>
  )
}
