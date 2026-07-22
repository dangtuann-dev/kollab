import React from 'react'
import type { ReactNode } from 'react'
import { FolderKanban } from 'lucide-react'
import { Button } from '../ui/Button'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  action?: ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/40 dark:bg-neutral-900/40 max-w-md mx-auto my-6 font-sans">
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mb-4 shadow-xs">
        {icon || <FolderKanban className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      
      {onAction && actionLabel && (
        <Button variant="primary" size="sm" onClick={onAction} className="text-xs font-bold px-4 py-2">
          {actionLabel}
        </Button>
      )}

      {!onAction && action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}

export default EmptyState
