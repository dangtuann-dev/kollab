import React, { useState } from 'react'
import { Sparkles, Kanban, ListTodo, TrendingUp, ChevronRight, ChevronLeft, Rocket, CheckCircle2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useOnboardingStore } from '../../stores/onboardingStore'

interface SlideItem {
  icon: React.ReactNode
  badge: string
  title: string
  description: string
  features: string[]
  gradient: string
}

export const WelcomeOnboardingModal: React.FC = () => {
  const { isWelcomeModalOpen, closeWelcomeModal } = useOnboardingStore()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides: SlideItem[] = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary-600" />,
      badge: 'Chào mừng bạn',
      title: 'Chào mừng đến với Không gian Làm việc Kollab',
      description: 'Nền tảng quản lý dự án theo phương pháp Agile/Scrum giúp nhóm làm việc hiệu quả, minh bạch và gắn kết hơn.',
      features: [
        'Quản lý không gian làm việc dự án tập trung',
        'Tùy chỉnh vai trò thành viên (Product Owner, Scrum Master, Developer)',
        'Cập nhật tiến độ dự án thời gian thực',
      ],
      gradient: 'from-primary-50 to-indigo-50 border-primary-100',
    },
    {
      icon: <ListTodo className="h-8 w-8 text-amber-600" />,
      badge: 'Bước 1: Backlog',
      title: 'Quản lý Backlog & User Stories',
      description: 'Lập danh sách các yêu cầu sản phẩm, gán điểm ước lượng (Story Points) và ưu tiên công việc quan trọng.',
      features: [
        'Tạo & sắp xếp User Story theo thứ tự ưu tiên',
        'Đánh giá dung lượng Sprint với Story Points',
        'Theo dõi tiến độ Backlog một cách trực quan',
      ],
      gradient: 'from-amber-50 to-orange-50 border-amber-100',
    },
    {
      icon: <Kanban className="h-8 w-8 text-emerald-600" />,
      badge: 'Bước 2: Sprint Board',
      title: 'Sprint Board & Bảng Kanban Trực quan',
      description: 'Kéo thả công việc giữa các trạng thái (To Do, In Progress, Review, Done) và cập nhật thời gian thực cho nhóm.',
      features: [
        'Kéo thả task mượt mà trên bảng Kanban',
        'Gán nhãn ưu tiên (Critical, High, Medium, Low)',
        'Đồng bộ trạng thái tức thì giữa các thành viên',
      ],
      gradient: 'from-emerald-50 to-teal-50 border-emerald-100',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      badge: 'Bước 3: Ceremonies & Reports',
      title: 'Hội họp Agile & Báo cáo Tiến độ',
      description: 'Thực hiện họp Standup hàng ngày, Sprint Planning, Retrospective và theo dõi Biểu đồ Burndown Chart.',
      features: [
        'Báo cáo Daily Standup nhanh chóng',
        'Phân tích biểu đồ Burndown Chart chính xác',
        'Tổng kết Retrospective sau mỗi chu kỳ Sprint',
      ],
      gradient: 'from-purple-50 to-pink-50 border-purple-100',
    },
  ]

  const activeSlide = slides[currentSlide]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      closeWelcomeModal()
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  if (!isWelcomeModalOpen) return null

  return (
    <Modal
      isOpen={isWelcomeModalOpen}
      onClose={closeWelcomeModal}
      title=""
      size="lg"
    >
      <div className="relative pt-2 pb-1 px-1">
        {/* Step Indicator Pills */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-8 bg-primary-600'
                    : idx < currentSlide
                    ? 'w-2 bg-primary-300'
                    : 'w-2 bg-neutral-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-neutral-400">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>

        {/* Slide Content */}
        <div className={`p-6 rounded-2xl border bg-gradient-to-br ${activeSlide.gradient} transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white shadow-sm rounded-xl border border-neutral-100 shrink-0">
              {activeSlide.icon}
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-neutral-700 shadow-xs border border-neutral-200/60 mb-1">
                {activeSlide.badge}
              </span>
              <h3 className="text-xl font-bold text-neutral-900 leading-snug">
                {activeSlide.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed mb-5">
            {activeSlide.description}
          </p>

          <div className="space-y-2 bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-neutral-200/50">
            <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Tính năng nổi bật:
            </p>
            {activeSlide.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Quay lại
          </Button>

          <div className="flex items-center gap-2">
            {currentSlide < slides.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWelcomeModal}
                className="text-neutral-500"
              >
                Bỏ qua
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={
                currentSlide === slides.length - 1 ? (
                  <Rocket className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              }
            >
              {currentSlide === slides.length - 1 ? 'Bắt đầu sử dụng' : 'Tiếp theo'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WelcomeOnboardingModal
