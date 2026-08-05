import React, { useState, useRef, useEffect } from 'react'
import { HelpCircle, Sparkles, RefreshCw, Eye } from 'lucide-react'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { useProjectStore } from '../../stores/projectStore'
import { useToast } from '../../stores/toastStore'

export const HelpGuideButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const { openWelcomeModal, showProjectGuide, resetOnboarding } = useOnboardingStore()
  const { currentProject } = useProjectStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpenWelcome = () => {
    openWelcomeModal()
    setIsOpen(false)
  }

  const handleShowProjectGuide = () => {
    if (currentProject) {
      showProjectGuide(currentProject.id)
      toast.success('Đã hiện lại thanh hướng dẫn cho dự án!')
    } else {
      toast.info('Vui lòng chọn một dự án để xem hướng dẫn.')
    }
    setIsOpen(false)
  }

  const handleResetAll = () => {
    resetOnboarding()
    toast.success('Đã khôi phục tất cả hướng dẫn sử dụng!')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors text-xs font-semibold"
        title="Trợ giúp & Hướng dẫn"
      >
        <HelpCircle className="h-4 w-4 text-primary-600" />
        <span className="hidden sm:inline">Trợ giúp</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-slide-up text-xs">
          <div className="px-3 py-2 border-b border-neutral-100">
            <p className="font-bold text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Hướng dẫn sử dụng</span>
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Khám phá các tính năng của Kollab</p>
          </div>

          <div className="py-1">
            <button
              onClick={handleOpenWelcome}
              className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 font-medium transition-colors"
            >
              <Eye className="h-4 w-4 text-primary-600" />
              <span>Xem lại Tour giới thiệu</span>
            </button>

            {currentProject && (
              <button
                onClick={handleShowProjectGuide}
                className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Hiện hướng dẫn dự án này</span>
              </button>
            )}

            <button
              onClick={handleResetAll}
              className="w-full text-left px-3 py-2 text-neutral-600 hover:bg-neutral-100 flex items-center gap-2 font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-neutral-500" />
              <span>Đặt lại tất cả hướng dẫn</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpGuideButton
