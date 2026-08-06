import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, AlertOctagon, HelpCircle, Save, CheckCircle2, ArrowLeft, CalendarDays, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../stores/toastStore'
import { useAuthStore } from '../../stores'
import type { StandupLog } from '../../types'

export const DailyStandup: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const projectIdStr = projectId || ''

  const [yesterday, setYesterday] = useState('')
  const [today, setToday] = useState('')
  const [blockers, setBlockers] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  
  const { data: standups, isLoading: loadingStandups } = useQuery({
    queryKey: ['standup-logs', projectIdStr, selectedDate],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('standup_logs') as any)
        .select(`
          *,
          profile:profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectIdStr)
        .eq('log_date', selectedDate)
      if (error) throw error
      return data as StandupLog[]
    },
    enabled: !!projectIdStr && !!selectedDate,
  })

  
  const myLogForDate = standups?.find(s => s.user_id === user?.id)

  
  useEffect(() => {
    if (selectedDate === new Date().toISOString().split('T')[0] && myLogForDate) {
      setYesterday(myLogForDate.yesterday)
      setToday(myLogForDate.today)
      setBlockers(myLogForDate.blockers || '')
    } else if (!myLogForDate) {
      setYesterday('')
      setToday('')
      setBlockers('')
    }
  }, [myLogForDate, selectedDate])

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!yesterday.trim() || !today.trim()) {
      toast.error('Vui lòng điền những gì bạn đã làm hôm qua và kế hoạch hôm nay.')
      return
    }

    setIsSubmitLoading(true)
    const payload = {
      project_id: projectIdStr,
      user_id: user?.id || '',
      yesterday,
      today,
      blockers: blockers.trim() || null,
      log_date: selectedDate,
    }

    try {
      if (myLogForDate) {
        
        const { error } = await (supabase
          .from('standup_logs') as any)
          .update({
            yesterday: payload.yesterday,
            today: payload.today,
            blockers: payload.blockers,
          })
          .eq('id', myLogForDate.id)

        if (error) throw error
        toast.success('Cập nhật bản tin Daily Standup thành công!')
      } else {
        
        const { error } = await (supabase
          .from('standup_logs') as any)
          .insert(payload)

        if (error) throw error
        toast.success('Đã lưu bản tin Daily Standup mới!')
      }
      
      queryClient.invalidateQueries({ queryKey: ['standup-logs', projectIdStr, selectedDate] })
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu standup log')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const isCurrentDate = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="flex flex-col gap-6 font-sans">
      {}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectIdStr}/ceremonies`)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Daily Standup (Họp hằng ngày)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Báo cáo tiến độ hằng ngày và cùng gỡ bỏ các vướng mắc (blockers).</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-neutral-400" />
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold bg-white border border-neutral-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Form bên trái - Chỉ hiện form ghi chép cho Ngày hiện tại */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-neutral-800">
              {myLogForDate ? 'Cập nhật cập nhật của bạn' : 'Đăng Daily Standup hôm nay'}
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              myLogForDate ? 'bg-success-50 text-success-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {myLogForDate ? 'Đã hoàn tất' : 'Chưa cập nhật'}
            </span>
          </div>

          {isCurrentDate ? (
            <form onSubmit={handleSaveLog} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Hôm qua bạn đã làm gì?
                </label>
                <textarea
                  rows={3}
                  value={yesterday}
                  onChange={(e) => setYesterday(e.target.value)}
                  placeholder="Mô tả tóm tắt các task đã hoàn thành hoặc đang thực hiện..."
                  className="w-full text-xs border border-neutral-250 rounded-lg p-2.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                  Hôm nay bạn dự định làm gì?
                </label>
                <textarea
                  rows={3}
                  value={today}
                  onChange={(e) => setToday(e.target.value)}
                  placeholder="Kế hoạch công việc và các mục tiêu chính trong ngày..."
                  className="w-full text-xs border border-neutral-250 rounded-lg p-2.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
                  Có khó khăn hay chướng ngại nào không?
                </label>
                <textarea
                  rows={2}
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="Các vấn đề kỹ thuật, sự phụ thuộc, thiết kế cần gỡ rối... (Bỏ trống nếu không có)"
                  className="w-full text-xs border border-neutral-250 rounded-lg p-2.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full mt-2"
                isLoading={isSubmitLoading}
                leftIcon={<Save className="h-4 w-4" />}
              >
                {myLogForDate ? 'Lưu cập nhật' : 'Gửi Standup Log'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-10 text-neutral-400 text-xs">
              Bạn không thể gửi hoặc chỉnh sửa standup log của ngày trước đó. Chỉ có thể cập nhật cho ngày hôm nay.
            </div>
          )}
        </div>

        {/* Danh sách cập nhật của team bên phải */}
        <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-neutral-500" />
              Bản tin Daily của Team ({selectedDate})
            </h3>
            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {standups?.length || 0} Thành viên
            </span>
          </div>

          {loadingStandups ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-6 w-6 text-neutral-400 animate-spin" />
              <p className="text-[11px] text-neutral-400">Đang tải lịch sử standups...</p>
            </div>
          ) : !standups || standups.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-neutral-100 rounded-xl py-24 text-center">
              <p className="text-xs text-neutral-400 font-medium">Chưa có ai đăng bản tin standup trong ngày này.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {standups.map((log) => (
                <div key={log.id} className="flex flex-col gap-2.5 pb-4 border-b border-neutral-100 last:border-b-0">
                  <div className="flex items-center gap-2.5">
                    {log.profile?.avatar_url ? (
                      <img
                        src={log.profile.avatar_url}
                        alt={log.profile.full_name}
                        className="h-8 w-8 rounded-full object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {log.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-neutral-800">{log.profile?.full_name || 'Thành viên'}</span>
                      <p className="text-[9px] text-neutral-400">
                        Đã đăng lúc {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400">Hôm qua</span>
                      <p className="text-xs text-neutral-700 leading-relaxed mt-1">{log.yesterday}</p>
                    </div>
                    <div className="bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-50">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-500">Hôm nay</span>
                      <p className="text-xs text-neutral-700 leading-relaxed mt-1">{log.today}</p>
                    </div>
                  </div>

                  {log.blockers && (
                    <div className="ml-10 flex gap-2 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700">
                      <AlertOctagon className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Khó khăn / Trở ngại:</span>
                        <p className="mt-0.5 text-rose-600 leading-relaxed">{log.blockers}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailyStandup
