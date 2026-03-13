import { useEffect } from 'react'
import { useToastStore } from '../../stores/index'

const TOAST_DURATION = 4000

/**
 * Auto-dismissing toast notifications.
 * Renders from the shared useToastStore.
 */
export const Toast = () => {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

/** @param {{ toast: { id: string, message: string, type: 'success'|'error'|'info' }, onDismiss: () => void }} props */
const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const colours = {
    success: 'bg-emerald-500/90 backdrop-blur-md',
    error: 'bg-rose-500/90 backdrop-blur-md',
    info: 'bg-sky-500/90 backdrop-blur-md',
  }

  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-xs items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${colours[toast.type] ?? colours.info}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}
