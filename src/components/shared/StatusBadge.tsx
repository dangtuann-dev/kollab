import React from 'react'
import { Badge } from '../ui/Badge'
import type { StoryStatus } from '../../types'

interface StatusBadgeProps {
  status: StoryStatus
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    backlog: {
      label: 'Backlog',
      variant: 'neutral' as const,
    },
    sprint: {
      label: 'Trong Sprint',
      variant: 'purple' as const,
    },
    done: {
      label: 'Hoàn thành',
      variant: 'success' as const,
    },
  }

  const current = configs[status] || configs.backlog

  return (
    <Badge variant={current.variant}>
      {current.label}
    </Badge>
  )
}
export default StatusBadge
