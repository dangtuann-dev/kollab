import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, FolderKanban, ListTodo, Target, CornerDownLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProjectStore } from '../../stores'
import { cn } from '../../lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  id: string
  type: 'project' | 'user_story' | 'task'
  title: string
  description: string
  project_id: string
  extra_info?: any
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useProjectStore()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  // Reset search state on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setDebouncedQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Fetch results via Supabase RPC if we have a projectId
  const { data: serverResults, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['global-search', projectId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2 || !projectId) return []

      const { data, error } = await (supabase as any).rpc('search_all', {
        search_query: debouncedQuery.trim(),
        p_project_id: projectId,
      })

      if (error) {
        console.error('Search error:', error)
        return []
      }

      return data as SearchResult[]
    },
    enabled: !!projectId && debouncedQuery.trim().length >= 2,
  })

  // Local project search for projects listed in store (useful when not in project route)
  const localProjectResults: SearchResult[] =
    debouncedQuery.trim().length >= 2
      ? projects
          .filter((p) => p.name.toLowerCase().includes(debouncedQuery.toLowerCase()))
          .map((p) => ({
            id: p.id,
            type: 'project',
            title: p.name,
            description: p.description || '',
            project_id: p.id,
            extra_info: { color: p.color },
          }))
      : []

  // Combine results (filter duplicates)
  const combinedResults: SearchResult[] = []
  const addedIds = new Set<string>()

  // Add local projects search results first
  localProjectResults.forEach((r) => {
    combinedResults.push(r)
    addedIds.add(r.id)
  })

  // Add server RPC results
  if (serverResults) {
    serverResults.forEach((r) => {
      if (!addedIds.has(r.id)) {
        combinedResults.push(r)
        addedIds.add(r.id)
      }
    })
  }

  // Handle navigate
  const handleItemClick = (item: SearchResult) => {
    onClose()
    if (item.type === 'project') {
      navigate(`/projects/${item.id}/board`)
    } else if (item.type === 'user_story') {
      navigate(`/projects/${item.project_id}/backlog`)
    } else if (item.type === 'task') {
      navigate(`/projects/${item.project_id}/board`)
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (combinedResults.length > 0 ? (prev + 1) % combinedResults.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          combinedResults.length > 0 ? (prev - 1 + combinedResults.length) % combinedResults.length : 0
        )
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (combinedResults.length > 0 && combinedResults[selectedIndex]) {
          handleItemClick(combinedResults[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, combinedResults, selectedIndex])

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [debouncedQuery])

  // Helper to highlight match keyword
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-100 text-amber-800 font-bold rounded-sm px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    )
  }

  // Grouped results
  const projectsGroup = combinedResults.filter((r) => r.type === 'project')
  const storiesGroup = combinedResults.filter((r) => r.type === 'user_story')
  const tasksGroup = combinedResults.filter((r) => r.type === 'task')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 no-print">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col font-sans animate-fade-in max-h-[500px]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-neutral-100">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm dự án, user story, task... (Nhập ít nhất 2 ký tự)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-none focus:ring-0 focus:outline-none py-4 text-sm text-neutral-800 placeholder-neutral-400"
          />
          <kbd className="hidden sm:inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center py-10 gap-2 text-xs text-neutral-500 font-semibold">
              <div className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Đang tìm kiếm...
            </div>
          )}

          {!isLoading && query.trim().length < 2 && (
            <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
              Nhập từ khóa tìm kiếm để bắt đầu.
            </div>
          )}

          {!isLoading && query.trim().length >= 2 && combinedResults.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
              Không tìm thấy kết quả nào phù hợp.
            </div>
          )}

          {!isLoading && combinedResults.length > 0 && (
            <div className="space-y-3">
              {/* Projects Group */}
              {projectsGroup.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">
                    Dự án
                  </div>
                  {projectsGroup.map((item) => {
                    const idx = combinedResults.indexOf(item)
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                          isSelected ? 'bg-primary-50/70 text-primary-950 font-semibold' : 'hover:bg-neutral-50'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderKanban className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-600' : 'text-neutral-400')} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {highlightText(item.title, debouncedQuery)}
                            </p>
                          </div>
                        </div>
                        {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-primary-500 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Stories Group */}
              {storiesGroup.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">
                    User Stories
                  </div>
                  {storiesGroup.map((item) => {
                    const idx = combinedResults.indexOf(item)
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                          isSelected ? 'bg-primary-50/70 text-primary-950 font-semibold' : 'hover:bg-neutral-50'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ListTodo className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-600' : 'text-neutral-400')} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {highlightText(item.title, debouncedQuery)}
                            </p>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              Backlog / Story Points: {item.extra_info?.story_points || 'Chưa định lượng'}
                            </p>
                          </div>
                        </div>
                        {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-primary-500 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tasks Group */}
              {tasksGroup.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">
                    Công việc (Tasks)
                  </div>
                  {tasksGroup.map((item) => {
                    const idx = combinedResults.indexOf(item)
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                          isSelected ? 'bg-primary-50/70 text-primary-950 font-semibold' : 'hover:bg-neutral-50'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Target className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary-600' : 'text-neutral-400')} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {highlightText(item.title, debouncedQuery)}
                            </p>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {item.extra_info?.story_title ? `Story: ${item.extra_info.story_title}` : 'Subtask'}
                            </p>
                          </div>
                        </div>
                        {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-primary-500 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
