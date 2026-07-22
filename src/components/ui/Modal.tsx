import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: React.ReactNode
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  footer,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in transition-all no-print font-sans"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'w-full h-full sm:h-auto max-h-screen sm:max-h-[85vh] bg-white dark:bg-neutral-900 rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-0 sm:border border-neutral-150 dark:border-neutral-800 overflow-hidden transform scale-100 sm:scale-95 animate-slide-up transition-all',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
