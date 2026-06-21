import React from 'react'
import { AlertOctagon, ChevronUp, ChevronRight, ChevronDown } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { StoryPriority } from '../../types'

interface PriorityBadgeProps {
  priority: StoryPriority
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const configs = {
    critical: {
      label: 'Khẩn cấp',
      variant: 'danger' as const,
      icon: <AlertOctagon className="h-3 w-3 mr-1 shrink-0" />,
    },
    high: {
      label: 'Cao',
      variant: 'warning' as const,
      icon: <ChevronUp className="h-3 w-3 mr-1 shrink-0" />,
    },
    medium: {
      label: 'Trung bình',
      variant: 'purple' as const,
      icon: <ChevronRight className="h-3 w-3 mr-1 shrink-0" />,
    },
    low: {
      label: 'Thấp',
      variant: 'neutral' as const,
      icon: <ChevronDown className="h-3 w-3 mr-1 shrink-0" />,
    },
  }

  const current = configs[priority] || configs.medium

  return (
    <Badge variant={current.variant} className="flex items-center">
      {current.icon}
      {current.label}
    </Badge>
  )
}
export default PriorityBadge
