import React, { useState } from 'react'
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
  likedBy: string[]
}

// Droppable Column Component
const DroppableColumn: React.FC<{
  id: 'went_well' | 'improve' | 'action_items'
  title: string
  colorClass: string
  headerBg: string
  icon: React.ReactNode
  children: React.ReactNode
  newNoteValue: string
  onNewNoteChange: (val: string) => void
  onAddNote: () => void
}> = ({ title, colorClass, headerBg, icon, children, newNoteValue, onNewNoteChange, onAddNote, id }) => {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-[280px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]"
    >
      <div className={`h-1 w-full ${colorClass}`} />
      <div className={`p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{title}</span>
        </div>
        <span className="text-[10px] font-bold text-neutral-500 bg-white/80 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700 px-2 py-0.5 rounded-full">
          {React.Children.count(children)} notes
        </span>
      </div>

      {/* Input */}
      <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex gap-2">
        <input
          type="text"
          placeholder="Viết ghi chú..."
          value={newNoteValue}
          onChange={(e) => onNewNoteChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddNote()}
          className="w-full text-xs border border-neutral-250 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white dark:bg-neutral-900 placeholder-neutral-400 text-neutral-800 dark:text-neutral-100"
        />
        <button
          onClick={onAddNote}
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
const DraggableNote: React.FC<{
  note: RetroNote
  userId?: string
  editingNoteId: string | null
  editingContent: string
  onEditChange: (val: string) => void
  onStartEdit: (id: string, content: string) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string) => void
  onDeleteNote: (id: string) => void
  onLikeNote: (id: string) => void
}> = ({
  note,
  userId,
  editingNoteId,
  editingContent,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteNote,
  onLikeNote,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const isAuthor = note.authorId === userId
  const hasLiked = note.likedBy.includes(userId || '')

  const cardBorders = {
    went_well: 'border-l-4 border-l-emerald-500 border-neutral-200 dark:border-neutral-800 bg-emerald-50/10 dark:bg-emerald-950/20 hover:bg-emerald-50/20',
    improve: 'border-l-4 border-l-amber-500 border-neutral-200 dark:border-neutral-800 bg-amber-50/10 dark:bg-amber-950/20 hover:bg-amber-50/20',
    action_items: 'border-l-4 border-l-indigo-500 border-neutral-200 dark:border-neutral-800 bg-indigo-50/10 dark:bg-indigo-950/20 hover:bg-indigo-50/20',
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
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full text-xs border border-neutral-300 dark:border-neutral-700 rounded p-1.5 focus:outline-none bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={onCancelEdit}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onSaveEdit(note.id)}
              className="p-1 text-emerald-500 hover:text-emerald-700"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div {...attributes} {...listeners} className="flex-1">
            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium select-none">
              {note.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100/80 dark:border-neutral-800 text-[10px]">
            <span className="text-neutral-450 dark:text-neutral-500 font-semibold">{note.authorName}</span>
            <div className="flex items-center gap-2">
              {isAuthor && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onStartEdit(note.id, note.content)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-neutral-400 hover:text-danger-600 p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => onLikeNote(note.id)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border transition-all ${
                  hasLiked
                    ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold dark:bg-rose-950/60 dark:border-rose-800'
                    : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700'
                }`}
              >
                <Heart className={`h-3 w-3 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{note.likes}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export const Retrospective: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const projectIdStr = projectId || ''

  const [notes, setNotes] = useState<RetroNote[]>(() => {
    const saved = localStorage.getItem(`retro-notes-${projectIdStr}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return [
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
    ]
  })

  const [newNoteContent, setNewNoteContent] = useState<Record<string, string>>({
    went_well: '',
    improve: '',
    action_items: '',
  })
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const saveNotes = (updated: RetroNote[]) => {
    setNotes(updated)
    localStorage.setItem(`retro-notes-${projectIdStr}`, JSON.stringify(updated))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const noteId = active.id as string
    const newColId = over.id as 'went_well' | 'improve' | 'action_items'

    const updated = notes.map((n) => (n.id === noteId ? { ...n, columnId: newColId } : n))
    saveNotes(updated)
  }

  const handleAddNote = (colId: 'went_well' | 'improve' | 'action_items') => {
    const text = newNoteContent[colId]?.trim()
    if (!text) return

    const newNote: RetroNote = {
      id: Math.random().toString(36).substring(2, 9),
      columnId: colId,
      content: text,
      authorName: user?.user_metadata?.full_name || user?.email || 'Thành viên',
      authorId: user?.id || 'anon',
      likes: 0,
      likedBy: [],
    }

    saveNotes([...notes, newNote])
    setNewNoteContent((prev) => ({ ...prev, [colId]: '' }))
    toast.success('Đã thêm ghi chú mới!')
  }

  const handleLikeNote = (noteId: string) => {
    const userId = user?.id || 'anon'
    const updated = notes.map((n) => {
      if (n.id === noteId) {
        const hasLiked = n.likedBy.includes(userId)
        return {
          ...n,
          likes: hasLiked ? n.likes - 1 : n.likes + 1,
          likedBy: hasLiked ? n.likedBy.filter((id) => id !== userId) : [...n.likedBy, userId],
        }
      }
      return n
    })
    saveNotes(updated)
  }

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId)
    saveNotes(updated)
    toast.success('Đã xóa ghi chú')
  }

  const handleSaveEdit = (noteId: string) => {
    if (!editingContent.trim()) return
    const updated = notes.map((n) => (n.id === noteId ? { ...n, content: editingContent.trim() } : n))
    saveNotes(updated)
    setEditingNoteId(null)
    toast.success('Đã cập nhật nội dung!')
  }

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả ghi chú Retro này?')) {
      saveNotes([])
      toast.success('Đã xóa tất cả ghi chú!')
    }
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectIdStr}/ceremonies`)}
            className="p-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl hover:bg-neutral-50 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Sprint Retrospective (Cải tiến Sprint)
              </h2>
              <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                Nghi thức 4
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Cùng nhìn lại Sprint đã qua: Những gì làm tốt, những gì cần cải tiến và kế hoạch hành động.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={handleClearAll}
            className="text-xs font-bold py-1.5 px-3 bg-white dark:bg-neutral-800 border-neutral-250 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200"
          >
            Làm mới Board
          </Button>
        </div>
      </div>

      {/* Retro Board Columns */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Column 1: Went Well */}
          <DroppableColumn
            id="went_well"
            title="Went Well (Làm tốt)"
            colorClass="border-t-emerald-500"
            headerBg="bg-emerald-50/50 dark:bg-emerald-950/40"
            icon={<Smile className="h-4 w-4 text-emerald-600" />}
            newNoteValue={newNoteContent.went_well}
            onNewNoteChange={(val) => setNewNoteContent((prev) => ({ ...prev, went_well: val }))}
            onAddNote={() => handleAddNote('went_well')}
          >
            {notes
              .filter((n) => n.columnId === 'went_well')
              .map((note) => (
                <DraggableNote
                  key={note.id}
                  note={note}
                  userId={user?.id}
                  editingNoteId={editingNoteId}
                  editingContent={editingContent}
                  onEditChange={setEditingContent}
                  onStartEdit={(id, content) => {
                    setEditingNoteId(id)
                    setEditingContent(content)
                  }}
                  onCancelEdit={() => setEditingNoteId(null)}
                  onSaveEdit={handleSaveEdit}
                  onDeleteNote={handleDeleteNote}
                  onLikeNote={handleLikeNote}
                />
              ))}
          </DroppableColumn>

          {/* Column 2: Improve */}
          <DroppableColumn
            id="improve"
            title="To Improve (Cải tiến)"
            colorClass="border-t-amber-500"
            headerBg="bg-amber-50/50 dark:bg-amber-950/40"
            icon={<Lightbulb className="h-4 w-4 text-amber-600" />}
            newNoteValue={newNoteContent.improve}
            onNewNoteChange={(val) => setNewNoteContent((prev) => ({ ...prev, improve: val }))}
            onAddNote={() => handleAddNote('improve')}
          >
            {notes
              .filter((n) => n.columnId === 'improve')
              .map((note) => (
                <DraggableNote
                  key={note.id}
                  note={note}
                  userId={user?.id}
                  editingNoteId={editingNoteId}
                  editingContent={editingContent}
                  onEditChange={setEditingContent}
                  onStartEdit={(id, content) => {
                    setEditingNoteId(id)
                    setEditingContent(content)
                  }}
                  onCancelEdit={() => setEditingNoteId(null)}
                  onSaveEdit={handleSaveEdit}
                  onDeleteNote={handleDeleteNote}
                  onLikeNote={handleLikeNote}
                />
              ))}
          </DroppableColumn>

          {/* Column 3: Action Items */}
          <DroppableColumn
            id="action_items"
            title="Action Items (Hành động)"
            colorClass="border-t-indigo-500"
            headerBg="bg-indigo-50/50 dark:bg-indigo-950/40"
            icon={<Award className="h-4 w-4 text-indigo-600" />}
            newNoteValue={newNoteContent.action_items}
            onNewNoteChange={(val) => setNewNoteContent((prev) => ({ ...prev, action_items: val }))}
            onAddNote={() => handleAddNote('action_items')}
          >
            {notes
              .filter((n) => n.columnId === 'action_items')
              .map((note) => (
                <DraggableNote
                  key={note.id}
                  note={note}
                  userId={user?.id}
                  editingNoteId={editingNoteId}
                  editingContent={editingContent}
                  onEditChange={setEditingContent}
                  onStartEdit={(id, content) => {
                    setEditingNoteId(id)
                    setEditingContent(content)
                  }}
                  onCancelEdit={() => setEditingNoteId(null)}
                  onSaveEdit={handleSaveEdit}
                  onDeleteNote={handleDeleteNote}
                  onLikeNote={handleLikeNote}
                />
              ))}
          </DroppableColumn>
        </div>
      </DndContext>
    </div>
  )
}

export default Retrospective
