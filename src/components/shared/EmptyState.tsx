import React from 'react'
import type { ReactNode } from 'react'
import { FolderKanban } from 'lucide-react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/30 max-w-lg mx-auto my-8">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 text-primary-600 mb-4">
        {icon || <FolderKanban className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-normal">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
export default EmptyState
