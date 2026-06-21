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
    todo: {
      label: 'Cần làm',
      variant: 'info' as const,
    },
    in_progress: {
      label: 'Đang làm',
      variant: 'purple' as const,
    },
    review: {
      label: 'Đang đánh giá',
      variant: 'warning' as const,
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
