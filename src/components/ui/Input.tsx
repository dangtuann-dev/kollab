import React from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, leftIcon, rightIcon, required, disabled, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7)
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700 flex items-center gap-0.5">
            {label}
            {required && <span className="text-danger-500 font-bold">*</span>}
          </label>
        )}
        
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              'block w-full rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:border-neutral-200',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon ? 'pr-10' : 'pr-3.5',
              'py-2',
              error
                ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:ring-danger-500 focus:border-danger-500'
                : 'border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:ring-primary-500 focus:border-primary-500',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger-600 mt-0.5" id={`${inputId}-error`}>
            {error}
          </p>
        )}
        
        {!error && hint && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
