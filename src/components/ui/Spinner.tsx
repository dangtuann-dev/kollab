import React from 'react'
import { cn } from '../../lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'neutral'
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md', color = 'primary', ...props }) => {
  const sizes = {
    sm: 'h-4 h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  const colors = {
    primary: 'border-neutral-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    neutral: 'border-neutral-200 border-t-neutral-600',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid',
        sizes[size],
        colors[color],
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
