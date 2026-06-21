import React from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { useToastStore } from '../../stores/toastStore'
import type { ToastItem } from '../../stores/toastStore'
import { cn } from '../../lib/utils'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastCardProps {
  toast: ToastItem
  onClose: () => void
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-danger-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-primary-500 shrink-0" />,
  }

  const borderColors = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning-500',
    info: 'border-l-primary-500',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-white border-l-4 rounded-r-lg shadow-lg border-neutral-100/50 pointer-events-auto transform transition-all duration-300 animate-slide-in-right',
        borderColors[toast.type]
      )}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium text-neutral-800 pt-0.5 leading-tight">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-neutral-600 rounded p-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
