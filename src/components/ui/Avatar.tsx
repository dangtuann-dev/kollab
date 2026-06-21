import React from 'react'
import { cn, formatInitial, stringToColor } from '../../lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  fallback?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = '',
  size = 'md',
  fallback,
  ...props
}) => {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const initials = fallback ? formatInitial(fallback) : formatInitial(alt || '?')
  const bgColor = stringToColor(fallback || alt || 'user')

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden font-semibold border-2 border-white select-none shrink-0',
        sizes[size],
        className
      )}
      style={!src ? { backgroundColor: bgColor, color: '#ffffff' } : undefined}
      title={alt || fallback}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Remove image if load fails to trigger fallback initials
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  className,
  children,
  max = 4,
  size = 'sm',
  ...props
}) => {
  const avatars = React.Children.toArray(children)
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex -space-x-2.5 overflow-hidden', className)} {...props}>
      {visibleAvatars.map((child) => {
        if (React.isValidElement<AvatarProps>(child)) {
          return React.cloneElement(child, { size })
        }
        return child;
      })}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 font-semibold border-2 border-white text-xs shrink-0',
            size === 'xs' && 'h-6 w-6 text-[9px]',
            size === 'sm' && 'h-8 w-8 text-xs',
            size === 'md' && 'h-10 w-10 text-sm',
            size === 'lg' && 'h-12 w-12 text-base'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
