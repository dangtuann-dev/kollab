import React from 'react'

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  iconOnly?: boolean
  showText?: boolean
  textClassName?: string
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = 'h-full w-full' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="24" fill="#09090b" />
    <path d="M50 20L76 32L50 44L24 32Z" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 43L50 55L76 43" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 54L50 66L76 54" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 65L50 77L76 65" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  iconOnly = false,
  showText = true,
  textClassName = '',
}) => {
  const sizeMap = {
    sm: { icon: 'h-7 w-7', text: 'text-base' },
    md: { icon: 'h-9 w-9', text: 'text-lg' },
    lg: { icon: 'h-11 w-11', text: 'text-xl' },
    xl: { icon: 'h-14 w-14', text: 'text-2xl' },
  }

  const currentSize = sizeMap[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${currentSize.icon} shrink-0`}>
        <LogoIcon />
      </div>
      {!iconOnly && showText && (
        <span className={`font-bold tracking-tight text-neutral-900 dark:text-white ${currentSize.text} ${textClassName}`}>
          Kollab
        </span>
      )}
    </div>
  )
}

export default Logo
