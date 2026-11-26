import { useEffect } from 'react'

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(onDismiss, 3200)
    return () => window.clearTimeout(timeout)
  }, [toast, onDismiss])

  if (!toast) return null
  return (
    <div className={`toast toast-${toast.tone || 'success'}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button className="icon-button" onClick={onDismiss} aria-label="सूचना बंद करें">×</button>
    </div>
  )
}
