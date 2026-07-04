import React from 'react'
import { Badge } from '../ui/Badge'
import type { SprintStatus } from '../../types'

interface SprintStatusBadgeProps {
  status: SprintStatus
  className?: string
}

export const SprintStatusBadge: React.FC<SprintStatusBadgeProps> = ({ status, className }) => {
  const configs = {
    planning: {
      label: 'Planning',
      variant: 'info' as const,
    },
    active: {
      label: 'Active',
      variant: 'success' as const,
    },
    completed: {
      label: 'Completed',
      variant: 'neutral' as const,
    },
  }

  const current = configs[status] || configs.planning

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  )
}

export default SprintStatusBadge
