import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, useDroppable, useDraggable } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, Heart, Pencil, Check, X, ArrowLeft, Lightbulb, RefreshCw, Smile, Award } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../stores/toastStore'
import { useAuthStore } from '../../stores'

interface RetroNote {
  id: string
  columnId: 'went_well' | 'improve' | 'action_items'
  content: string
  authorName: string
  authorId: string
  likes: number
  likedBy: string[] // user ids
}

export const Retrospective: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const projectIdStr = projectId || ''

  const [notes, setNotes] = useState<RetroNote[]>([])
  const [newNoteContent, setNewNoteContent] = useState<Record<string, string>>({
    went_well: '',
    improve: '',
    action_items: '',
  })
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(`retro-notes-${projectIdStr}`)
    if (saved) {
      try {
        setNotes(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      // Default placeholder notes
      setNotes([
        {
          id: '1',
          columnId: 'went_well',
          content: 'Cả đội đã phối hợp rất tốt để bàn giao đúng hạn.',
          authorName: 'Admin',
          authorId: 'system',
          likes: 2,
          likedBy: [],
        },
        {
          id: '2',
          columnId: 'improve',
          content: 'Cần kiểm tra kỹ các thay đổi code trước khi merge để tránh bug.',
          authorName: 'Admin',
          authorId: 'system',
          likes: 1,
          likedBy: [],
        },
      ])
    }
  }, [projectIdStr])

  // Save to LocalStorage
  const saveNotes = (updatedNotes: RetroNote[]) => {
    setNotes(updatedNotes)
    localStorage.setItem(`retro-notes-${projectIdStr}`, JSON.stringify(updatedNotes))
  }

  const handleAddNote = (columnId: 'went_well' | 'improve' | 'action_items') => {
    const content = newNoteContent[columnId]
    if (!content.trim()) return

    const newNote: RetroNote = {
      id: Math.random().toString(36).substring(2, 9),
      columnId,
      content: content.trim(),
      authorName: user?.user_metadata?.full_name || user?.email || 'Thành viên',
      authorId: user?.id || 'anonymous',
      likes: 0,
      likedBy: [],
    }

    const updated = [...notes, newNote]
    saveNotes(updated)
    setNewNoteContent(prev => ({ ...prev, [columnId]: '' }))
    toast.success('Đã thêm ghi chú retro mới!')
  }

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id)
    saveNotes(updated)
    toast.success('Đã xoá ghi chú retro!')
  }

  const handleLikeNote = (id: string) => {
    if (!user) return
    const updated = notes.map(n => {
      if (n.id === id) {
        const hasLiked = n.likedBy.includes(user.id)
        return {
          ...n,
          likes: hasLiked ? n.likes - 1 : n.likes + 1,
          likedBy: hasLiked ? n.likedBy.filter(uid => uid !== user.id) : [...n.likedBy, user.id],
        }
      }
      return n
    })
    saveNotes(updated)
  }

  const handleStartEdit = (note: RetroNote) => {
    setEditingNoteId(note.id)
    setEditingContent(note.content)
  }

  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) return
    const updated = notes.map(n => (n.id === id ? { ...n, content: editingContent.trim() } : n))
    saveNotes(updated)
    setEditingNoteId(null)
    setEditingContent('')
    toast.success('Ghi chú đã được cập nhật!')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const targetColumn = over.id as 'went_well' | 'improve' | 'action_items'

    const updated = notes.map(n => {
      if (n.id === activeId) {
        return { ...n, columnId: targetColumn }
      }
      return n
    })
    saveNotes(updated)
  }

  // Droppable Column Component
  const DroppableColumn: React.FC<{
    id: 'went_well' | 'improve' | 'action_items'
    title: string
    colorClass: string
    headerBg: string
    icon: React.ReactNode
    children: React.ReactNode
  }> = ({ id, title, colorClass, headerBg, icon, children }) => {
    const { setNodeRef } = useDroppable({ id })
    return (
      <div
        ref={setNodeRef}
        className={`flex-1 min-w-[280px] bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]`}
      >
        <div className={`h-1 w-full ${colorClass}`} />
        <div className={`p-4 border-b border-neutral-100 flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs font-bold text-neutral-800">{title}</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 bg-white/80 border border-neutral-200/50 px-2 py-0.5 rounded-full">
            {React.Children.count(children)} notes
          </span>
        </div>

        {/* Input */}
        <div className="p-3 border-b border-neutral-100 bg-neutral-50/50 flex gap-2">
          <input
            type="text"
            placeholder="Viết ghi chú..."
            value={newNoteContent[id]}
            onChange={(e) => setNewNoteContent(prev => ({ ...prev, [id]: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote(id)}
            className="w-full text-xs border border-neutral-250 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white placeholder-neutral-400 text-neutral-800"
          />
          <button
            onClick={() => handleAddNote(id)}
            className="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
          {children}
        </div>
      </div>
    )
  }

  // Draggable Note Card Component
  const DraggableNote: React.FC<{ note: RetroNote }> = ({ note }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: note.id,
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      opacity: isDragging ? 0.5 : 1,
    }

    const isAuthor = note.authorId === user?.id
    const hasLiked = note.likedBy.includes(user?.id || '')

    const cardBorders = {
      went_well: 'border-l-4 border-l-emerald-500 border-neutral-200 bg-emerald-50/10 hover:bg-emerald-50/20',
      improve: 'border-l-4 border-l-amber-500 border-neutral-200 bg-amber-50/10 hover:bg-amber-50/20',
      action_items: 'border-l-4 border-l-indigo-500 border-neutral-200 bg-indigo-50/10 hover:bg-indigo-50/20',
    }[note.columnId]

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3.5 border rounded-xl flex flex-col gap-2.5 transition-all duration-200 group relative ${cardBorders} ${
          isDragging ? 'shadow-lg rotate-1 z-50 cursor-grabbing' : 'shadow-sm hover:shadow-md cursor-grab'
        }`}
      >
        {editingNoteId === note.id ? (
          <div className="flex flex-col gap-2">
            <textarea
              rows={2}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded p-1.5 focus:outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setEditingNoteId(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleSaveEdit(note.id)}
                className="p-1 text-emerald-500 hover:text-emerald-700"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2" {...attributes} {...listeners}>
            <p className="text-xs text-neutral-800 leading-relaxed font-semibold">{note.content}</p>
            <div className="flex items-center justify-between mt-1.5 text-[10px] font-semibold text-neutral-400">
              <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">{note.authorName}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLikeNote(note.id)
                  }}
                  className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${
                    hasLiked ? 'text-rose-500 font-bold' : ''
                  }`}
                >
                  <Heart className={`h-3 w-3 ${hasLiked ? 'fill-rose-500' : ''}`} />
                  <span>{note.likes}</span>
                </button>

                {isAuthor && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartEdit(note)
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectIdStr}/ceremonies`)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Retrospective (Cải tiến Sprint)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Thảo luận rút kinh nghiệm để cải tiến quy trình làm việc trong các Sprint tiếp theo.</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const confirmClear = window.confirm('Bạn có chắc chắn muốn làm mới bảng Retrospective?')
            if (confirmClear) {
              saveNotes([])
              toast.success('Đã làm mới bảng!')
            }
          }}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Làm mới bảng
        </Button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Cột 1: Went Well */}
          <DroppableColumn
            id="went_well"
            title="Went Well (Làm tốt)"
            colorClass="border-t-emerald-500"
            headerBg="bg-emerald-50/50"
            icon={<Smile className="h-4.5 w-4.5 text-emerald-500" />}
          >
            {notes
              .filter(n => n.columnId === 'went_well')
              .map(note => (
                <DraggableNote key={note.id} note={note} />
              ))}
          </DroppableColumn>

          {/* Cột 2: Improve */}
          <DroppableColumn
            id="improve"
            title="To Improve (Cải tiến)"
            colorClass="border-t-amber-500"
            headerBg="bg-amber-50/50"
            icon={<Lightbulb className="h-4.5 w-4.5 text-amber-500" />}
          >
            {notes
              .filter(n => n.columnId === 'improve')
              .map(note => (
                <DraggableNote key={note.id} note={note} />
              ))}
          </DroppableColumn>

          {/* Cột 3: Action Items */}
          <DroppableColumn
            id="action_items"
            title="Action Items (Hành động)"
            colorClass="border-t-indigo-500"
            headerBg="bg-indigo-50/50"
            icon={<Award className="h-4.5 w-4.5 text-indigo-500" />}
          >
            {notes
              .filter(n => n.columnId === 'action_items')
              .map(note => (
                <DraggableNote key={note.id} note={note} />
              ))}
          </DroppableColumn>
        </div>
      </DndContext>
    </div>
  )
}

export default Retrospective
