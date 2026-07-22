import React, { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'

interface OnboardingTooltipProps {
  storageKey: string
  title: string
  content: string
  children: React.ReactNode
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  storageKey,
  title,
  content,
  children,
}) => {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const isDismissed = localStorage.getItem(`kollab_onboarding_${storageKey}`) === 'true'
    setDismissed(isDismissed)
  }, [storageKey])

  const handleDismiss = () => {
    localStorage.setItem(`kollab_onboarding_${storageKey}`, 'true')
    setDismissed(true)
  }

  return (
    <div className="relative inline-block w-full">
      {children}
      {!dismissed && (
        <div className="absolute top-full left-0 mt-2 z-40 w-72 bg-neutral-900 text-white p-3.5 rounded-2xl shadow-2xl border border-neutral-700 animate-slide-up text-xs font-sans">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{title}</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-white p-0.5 rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed mb-3">{content}</p>
          <button
            onClick={handleDismiss}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition-colors text-center"
          >
            Đã hiểu
          </button>
        </div>
      )}
    </div>
  )
}

export default OnboardingTooltip
