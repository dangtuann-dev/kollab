import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}) => {
  const variants = {
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    neutral: 'bg-neutral-50 text-neutral-600 border-neutral-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-full border',
    md: 'px-2.5 py-1 text-sm font-semibold rounded-full border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center text-center leading-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
export default Badge
