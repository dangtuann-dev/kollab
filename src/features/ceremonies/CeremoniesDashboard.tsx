import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, Users, ClipboardCheck, MessageSquarePlus, Compass } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const CeremoniesDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()

  const ceremoniesList = [
    {
      id: 'sprint-planning',
      title: 'Sprint Planning (Lập kế hoạch)',
      description: 'Tính toán dung lượng (capacity) của đội nhóm dựa trên số lượng thành viên, thời gian làm việc và so sánh với tổng số Story Points được đề xuất.',
      icon: <Calendar className="h-6 w-6 text-indigo-500" />,
      color: 'from-indigo-500/20 to-purple-500/20 hover:border-indigo-500/50',
      tag: 'Trước Sprint',
    },
    {
      id: 'daily-standup',
      title: 'Daily Standup (Họp hằng ngày)',
      description: 'Cập nhật nhanh công việc hằng ngày của các thành viên qua 3 câu hỏi cốt lõi: Đã làm gì? Sẽ làm gì? Khó khăn gì? Đồng bộ thông tin toàn đội.',
      icon: <Users className="h-6 w-6 text-emerald-500" />,
      color: 'from-emerald-500/20 to-teal-500/20 hover:border-emerald-500/50',
      tag: 'Trong Sprint',
    },
    {
      id: 'sprint-review',
      title: 'Sprint Review (Sơ kết Sprint)',
      description: 'Kiểm tra và đánh giá lại các User Story đã hoàn thành theo Acceptance Criteria, chạy thử demo sản phẩm và ghi nhận phản hồi từ khách hàng.',
      icon: <ClipboardCheck className="h-6 w-6 text-amber-500" />,
      color: 'from-amber-500/20 to-orange-500/20 hover:border-amber-500/50',
      tag: 'Cuối Sprint',
    },
    {
      id: 'retrospective',
      title: 'Retrospective (Cải tiến Sprint)',
      description: 'Nhìn nhận lại quá trình làm việc qua mô hình 3 cột: Went Well (Điểm tốt), To Improve (Cải tiến), và Action Items (Hành động sửa đổi).',
      icon: <MessageSquarePlus className="h-6 w-6 text-rose-500" />,
      color: 'from-rose-500/20 to-pink-500/20 hover:border-rose-500/50',
      tag: 'Cuối Sprint',
    },
  ]

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1.5 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Nghi thức Scrum</h2>
        </div>
        <p className="text-xs text-neutral-500">
          Chọn một nghi thức Scrum để thực hiện và theo dõi cùng các thành viên trong đội nhóm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ceremoniesList.map((ceremony) => (
          <div
            key={ceremony.id}
            onClick={() => navigate(`/projects/${projectId}/ceremonies/${ceremony.id}`)}
            className={`cursor-pointer group flex flex-col justify-between p-6 bg-gradient-to-br ${ceremony.color} bg-white border border-neutral-200/60 rounded-2xl shadow-sm hover:shadow-glass hover:-translate-y-0.5 transition-all duration-300`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white border border-neutral-100 rounded-xl shadow-sm">
                  {ceremony.icon}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                  {ceremony.tag}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  {ceremony.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {ceremony.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50/50 border-none group-hover:bg-primary-100/70 py-1.5 px-3 rounded-lg"
              >
                Bắt đầu
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CeremoniesDashboard
