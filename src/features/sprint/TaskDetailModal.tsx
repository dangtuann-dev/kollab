import React, { useState, useEffect, useRef } from 'react'
import { X, MessageSquare, ListTodo, Loader2, Paperclip, Clipboard } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Task, Comment, ProjectMember, ActivityLog } from '../../types'
import { useAuthStore } from '../../stores'
import { useToast } from '../../stores/toastStore'
import { Button } from '../../components/ui/Button'

interface TaskDetailModalProps {
  task: Task
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projectId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details')
  const [descTab, setDescTab] = useState<'write' | 'preview'>('write')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [storyPoints, setStoryPoints] = useState<number | ''>('')
  const [labels, setLabels] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [status, setStatus] = useState<Task['status']>('todo')

  const [newCommentText, setNewCommentText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  
  const saveTimeoutRef = useRef<any>(null)

  
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'medium')
      setStoryPoints(task.story_points ?? '')
      setLabels(task.labels || '')
      setDeadline(task.deadline || '')
      setAssigneeId(task.assignee_id || '')
      setStatus(task.status || 'todo')
      setActiveTab('details')
    }
  }, [task])

  
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    enabled: false,
  })
  const members: ProjectMember[] = (project as any)?.members || []

  
  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('comments')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: true }) as any)
      if (error) throw error
      return data as Comment[]
    },
    enabled: isOpen && activeTab === 'comments',
  })

  
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['activities', task.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('activity_logs')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: false }) as any)
      if (error) throw error
      return data as ActivityLog[]
    },
    enabled: isOpen && activeTab === 'activity',
  })

  
  const mutateTaskDetails = async (fields: any) => {
    try {
      const { error } = await (supabase
        .from('tasks') as any)
        .update(fields)
        .eq('id', task.id)
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['tasks-board'] })
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi cập nhật chi tiết')
    }
  }

  
  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      mutateTaskDetails({ title: title.trim() })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  
  const handleDescriptionChange = (val: string) => {
    setDescription(val)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      mutateTaskDetails({ description: val })
    }, 1000)
  }

  
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim() || !user) return

    try {
      const { error } = await (supabase
        .from('comments') as any)
        .insert({
          task_id: task.id,
          user_id: user.id,
          content: newCommentText.trim(),
          user_story_id: task.user_story_id,
        })
      if (error) throw error
      setNewCommentText('')
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] })
      queryClient.invalidateQueries({ queryKey: ['activities', task.id] })
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi bình luận')
    }
  }

  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng file tối đa là 10MB')
      return
    }

    setIsUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `${task.id}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('attachments').getPublicUrl(filePath)
      const attachmentMarkdown = `\n\n[📎 ${file.name}](${data.publicUrl})`
      
      const newDesc = description + attachmentMarkdown
      setDescription(newDesc)
      await mutateTaskDetails({ description: newDesc })
      toast.success('Tải file đính kèm lên thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải file lên')
    } finally {
      setIsUploading(false)
    }
  }

  const parseMarkdown = (text: string) => {
    if (!text) return '<p class="text-xs text-neutral-400">Không có mô tả.</p>'
    return text
      .split('\n')
      .map((line) => {
        if (line.startsWith('# ')) return `<h1 class="text-sm font-bold text-neutral-850 mt-3 border-b pb-1">${line.slice(2)}</h1>`
        if (line.startsWith('## ')) return `<h2 class="text-xs font-bold text-neutral-800 mt-2">${line.slice(3)}</h2>`
        if (line.startsWith('- [ ] ') || line.startsWith('* [ ] ')) {
          return `<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded border-neutral-300" /> <span class="text-xs text-neutral-700">${line.slice(6)}</span></div>`
        }
        if (line.startsWith('- [x] ') || line.startsWith('* [x] ')) {
          return `<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled checked class="rounded border-neutral-300" /> <span class="text-xs text-neutral-450 line-through">${line.slice(6)}</span></div>`
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return `<li class="text-xs text-neutral-700 list-disc ml-4 my-0.5">${line.slice(2)}</li>`
        }
        const linkRegex = /\[(.*?)\]\((.*?)\)/g
        if (linkRegex.test(line)) {
          const renderedLine = line.replace(linkRegex, '<a href="$2" target="_blank" class="text-primary-600 font-bold hover:underline">$1</a>')
          return `<p class="text-xs text-neutral-700 my-1">${renderedLine}</p>`
        }
        return `<p class="text-xs text-neutral-600 my-1 min-h-[1em]">${line}</p>`
      })
      .join('')
  }

  const isOverdue = deadline && new Date(deadline) < new Date() && status !== 'done'

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-45 bg-neutral-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-neutral-250 shadow-2xl flex flex-col h-full font-sans animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-150 shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">
              CÔNG VIỆC / TASK-{task.id.substring(0, 4).toUpperCase()}
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-base font-bold text-neutral-850 border-none outline-none focus:bg-neutral-50 rounded px-1.5 py-0.5 -ml-1.5 w-[450px]"
            />
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1.5 hover:bg-neutral-50 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-neutral-150 text-xs font-bold text-neutral-500 bg-neutral-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'details' ? 'border-primary-500 text-primary-600 bg-white' : 'border-transparent hover:bg-neutral-100/50'
            }`}
          >
            <ListTodo className="h-4.5 w-4.5 inline mr-1.5" />
            Chi tiết
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'comments' ? 'border-primary-500 text-primary-600 bg-white' : 'border-transparent hover:bg-neutral-100/50'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5 inline mr-1.5" />
            Thảo luận ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'activity' ? 'border-primary-500 text-primary-600 bg-white' : 'border-transparent hover:bg-neutral-100/50'
            }`}
          >
            <Clipboard className="h-4.5 w-4.5 inline mr-1.5" />
            Hoạt động ({activities.length})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column (Details/Comments/Activity) */}
          <div className="flex-1 overflow-y-auto p-5 border-r border-neutral-150">
            {activeTab === 'details' && (
              <div className="flex flex-col gap-5 h-full">
                {/* Description Editor */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Mô tả công việc</span>
                    <div className="flex bg-neutral-100 p-0.5 rounded-lg text-[10px] font-semibold text-neutral-600">
                      <button
                        onClick={() => setDescTab('write')}
                        className={`px-2 py-0.5 rounded ${descTab === 'write' ? 'bg-white shadow-xs font-bold text-neutral-800' : ''}`}
                      >
                        Viết
                      </button>
                      <button
                        onClick={() => setDescTab('preview')}
                        className={`px-2 py-0.5 rounded ${descTab === 'preview' ? 'bg-white shadow-xs font-bold text-neutral-800' : ''}`}
                      >
                        Xem trước
                      </button>
                    </div>
                  </div>

                  {descTab === 'write' ? (
                    <textarea
                      rows={8}
                      value={description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder="Mô tả công việc chi tiết. Hỗ trợ cú pháp Markdown..."
                      className="w-full text-xs border border-neutral-250 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-neutral-850"
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(description) }}
                      className="p-3 border border-neutral-100 bg-neutral-50/50 rounded-xl min-h-[160px] overflow-y-auto"
                    />
                  )}
                  <span className="text-[10px] text-neutral-400 italic">Tự động lưu sau 1s khi dừng gõ.</span>
                </div>

                {/* File Attachment Upload area */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Đính kèm file</span>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-250 rounded-xl p-6 text-center hover:bg-neutral-50/50 hover:border-neutral-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Paperclip className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-xs font-bold text-neutral-700">Nhấp để đính kèm file</span>
                    <span className="text-[10px] text-neutral-450">Hỗ trợ file lên tới 10MB</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isUploading && (
                    <div className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold self-center mt-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang tải file đính kèm...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="flex flex-col gap-4 h-full">
                {loadingComments ? (
                  <div className="flex justify-center p-10">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-10">Chưa có bình luận nào. Thảo luận cùng đội nhóm của bạn!</p>
                ) : (
                  <div className="flex flex-col gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-100 rounded-xl shadow-xs">
                        {comment.author?.avatar_url ? (
                          <img
                            src={comment.author.avatar_url}
                            alt={comment.author.full_name || 'User'}
                            className="h-8 w-8 rounded-full object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xs">
                            {comment.author?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-800">{comment.author?.full_name || 'Thành viên'}</span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex flex-col gap-2 mt-auto border-t border-neutral-100 pt-3">
                  <textarea
                    rows={2}
                    placeholder="Bình luận mới..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full text-xs border border-neutral-250 rounded-xl p-2.5 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Gửi</Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="flex flex-col gap-4">
                {loadingActivities ? (
                  <div className="flex justify-center p-10">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-10">Không tìm thấy lịch sử hoạt động.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activities.map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs">
                        <div className="relative flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-neutral-400 z-10" />
                          <div className="w-0.5 bg-neutral-200 flex-1 my-1" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-neutral-850">
                            {act.profile?.full_name || 'Hệ thống'}{' '}
                            <span className="text-neutral-500 font-medium">
                              {act.action === 'created' && 'đã tạo công việc.'}
                              {act.action === 'status_changed' && `đã đổi trạng thái sang ${(act.new_value as any)?.status}.`}
                              {act.action === 'assigned' && `đã giao việc cho thành viên.`}
                              {act.action === 'commented' && 'đã thêm bình luận.'}
                              {act.action === 'field_updated' && 'đã cập nhật thuộc tính.'}
                            </span>
                          </p>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {new Date(act.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar (Metadata Settings) */}
          <div className="w-60 shrink-0 p-5 flex flex-col gap-4 bg-neutral-50/50">
            {/* Status selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as Task['status']
                  setStatus(val)
                  mutateTaskDetails({ status: val })
                }}
                className="w-full text-xs font-bold bg-white border border-neutral-250 rounded-lg p-2 focus:ring-1 focus:ring-primary-500"
              >
                <option value="todo">📋 Cần làm (To Do)</option>
                <option value="in_progress">⚙️ Đang làm (In Progress)</option>
                <option value="done">✅ Hoàn thành (Done)</option>
              </select>
            </div>

            {/* Assignee selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Người thực hiện</label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  const val = e.target.value
                  setAssigneeId(val)
                  mutateTaskDetails({ assignee_id: val || null })
                }}
                className="w-full text-xs font-semibold bg-white border border-neutral-250 rounded-lg p-2 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Chưa phân công</option>
                {members.map((member) => (
                  <option key={member.id} value={member.user_id}>
                    {member.profile?.full_name || member.user_id}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as Task['priority']
                  setPriority(val)
                  mutateTaskDetails({ priority: val })
                }}
                className="w-full text-xs font-semibold bg-white border border-neutral-250 rounded-lg p-2 focus:ring-1 focus:ring-primary-500"
              >
                <option value="critical">🔴 Khẩn cấp</option>
                <option value="high">🟠 Cao</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="low">🟢 Thấp</option>
              </select>
            </div>

            {/* Labels Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Nhãn dán</label>
              <input
                type="text"
                value={labels}
                placeholder="Nhãn (e.g. Bug, Feature)"
                onChange={(e) => setLabels(e.target.value)}
                onBlur={() => {
                  if (labels !== task.labels) {
                    mutateTaskDetails({ labels: labels.trim() || null })
                  }
                }}
                className="w-full text-xs border border-neutral-255 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
              />
            </div>

            {/* Story Points Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Story Points</label>
              <input
                type="number"
                min="0"
                value={storyPoints}
                placeholder="Điểm số (SP)"
                onChange={(e) => setStoryPoints(e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={() => {
                  if (storyPoints !== task.story_points) {
                    mutateTaskDetails({ story_points: storyPoints === '' ? null : Number(storyPoints) })
                  }
                }}
                className="w-full text-xs border border-neutral-255 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold text-center"
              />
            </div>

            {/* Deadline selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Hạn chót</label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    const val = e.target.value
                    setDeadline(val)
                    mutateTaskDetails({ deadline: val || null })
                  }}
                  className={`w-full text-xs border border-neutral-255 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold ${
                    isOverdue ? 'text-rose-600 border-rose-300 font-bold' : ''
                  }`}
                />
              </div>
              {isOverdue && (
                <span className="text-[9px] text-rose-500 font-bold mt-0.5 animate-pulse">Quá hạn chót!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TaskDetailModal
