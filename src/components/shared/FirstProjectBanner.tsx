import React from 'react'
import { Rocket, Plus } from 'lucide-react'
import { Button } from '../ui/Button'

interface FirstProjectBannerProps {
  onCreateProject: () => void
}

export const FirstProjectBanner: React.FC<FirstProjectBannerProps> = ({ onCreateProject }) => {
  return (
    <div className="bg-gradient-to-r from-primary-900 via-primary-700 to-primary-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-sans">
      <div className="flex items-start gap-4 max-w-xl">
        <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
          <Rocket className="h-6 w-6 text-amber-300" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">Chào mừng bạn đến với Kollab Agile PM!</h2>
          <p className="text-xs text-primary-100 mt-1 leading-relaxed">
            Bắt đầu tạo dự án đầu tiên của bạn để thiết lập quy trình Scrum/Kanban, mời thành viên và quản lý Sprint hiệu quả.
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={onCreateProject}
        className="text-xs font-extrabold py-2.5 px-5 bg-white text-primary-900 hover:bg-neutral-100 border-none shadow-md shrink-0"
      >
        Tạo Dự án Mới
      </Button>
    </div>
  )
}

export default FirstProjectBanner
