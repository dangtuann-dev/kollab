import React, { useState, useEffect } from 'react'
import { X, Trash2, MessageSquare, ListTodo, Save, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Story, Task, Comment, ProjectMember } from '../../types'
import { useAuthStore } from '../../stores'
import { useToast } from '../../stores/toastStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface StoryDetailPanelProps {
  story: Story | null
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export const StoryDetailPanel: React.FC<StoryDetailPanelProps> = ({
  story,
  projectId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'comments'>('details')
  
  // Details form edit state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('')
  const [storyPoints, setStoryPoints] = useState<number | ''>('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [assigneeId, setAssigneeId] = useState('')

  // New task/comment inputs
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskHours, setNewTaskHours] = useState(0)
  const [newCommentText, setNewCommentText] = useState('')

  // Sync edits when story changes
  useEffect(() => {
    if (story) {
      setTitle(story.title || '')
      setDescription(story.description || '')
      setAcceptanceCriteria(story.acceptance_criteria || '')
      setStoryPoints(story.story_points ?? '')
      setPriority(story.priority || 'medium')
      setAssigneeId(story.assignee_id || '')
      setActiveTab('details')
    }
  }, [story])

  // Get project members for assignee dropdown
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    enabled: false, // Eagerly loaded in hook, retrieve from cache
  })
  const members: ProjectMember[] = (project as any)?.members || []

  // 1. Fetch Sub-tasks
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', story?.id],
    queryFn: async () => {
      if (!story?.id) return []
      const { data, error } = await (supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles(*)
        `)
        .eq('story_id', story.id)
        .order('created_at', { ascending: true }) as any)

      if (error) throw error
      return data as Task[]
    },
    enabled: !!story?.id && activeTab === 'tasks',
  })

  // 2. Fetch Comments
  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', story?.id],
    queryFn: async () => {
      if (!story?.id) return []
      const { data, error } = await (supabase
        .from('comments')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('story_id', story.id)
        .order('created_at', { ascending: true }) as any)

      if (error) throw error
      return data as Comment[]
    },
    enabled: !!story?.id && activeTab === 'comments',
  })

  // 3. Real-time Channel for Comments
  useEffect(() => {
    if (!story?.id || activeTab !== 'comments') return

    // Subscribe to comments updates
    const channel = supabase
      .channel(`comments-story-${story.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `story_id=eq.${story.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', story.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [story?.id, activeTab, queryClient])

  // Mutations
  const updateStoryDetails = useMutation<any, Error, void>({
    mutationFn: async () => {
      if (!story?.id) return
      const { data, error } = await ((supabase
        .from('stories') as any)
        .update({
          title,
          description,
          acceptance_criteria: acceptanceCriteria,
          story_points: storyPoints === '' ? null : Number(storyPoints),
          priority,
          assignee_id: assigneeId || null,
        })
        .eq('id', story.id)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Story details saved!')
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save story details')
    },
  })

  const createTask = useMutation<any, Error, void>({
    mutationFn: async () => {
      if (!story?.id || !newTaskTitle) return
      const { data, error } = await ((supabase
        .from('tasks') as any)
        .insert({
          story_id: story.id,
          title: newTaskTitle,
          estimated_hours: newTaskHours,
          status: 'todo',
        })
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      setNewTaskTitle('')
      setNewTaskHours(0)
      queryClient.invalidateQueries({ queryKey: ['tasks', story?.id] })
    },
  })

  const toggleTaskStatus = useMutation<any, Error, Task>({
    mutationFn: async (task) => {
      const nextStatus = task.status === 'done' ? 'todo' : 'done'
      const { error } = await ((supabase
        .from('tasks') as any)
        .update({ status: nextStatus })
        .eq('id', task.id) as any)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', story?.id] })
    },
  })

  const deleteTask = useMutation<any, Error, string>({
    mutationFn: async (taskId) => {
      const { error } = await (supabase.from('tasks') as any).delete().eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', story?.id] })
    },
  })

  const createComment = useMutation<any, Error, void>({
    mutationFn: async () => {
      if (!story?.id || !newCommentText || !user) return
      const { data, error } = await ((supabase
        .from('comments') as any)
        .insert({
          story_id: story.id,
          author_id: user.id,
          content: newCommentText,
        })
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      setNewCommentText('')
      queryClient.invalidateQueries({ queryKey: ['comments', story?.id] })
    },
  })

  if (!isOpen || !story) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-neutral-900/30 backdrop-blur-xs" onClick={onClose} />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white border-l border-neutral-250 shadow-2xl flex flex-col h-full font-sans animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-150">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400">
              STORY-{story.id.substring(0, 4).toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-neutral-800 truncate max-w-[300px]">
              {story.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 rounded-lg p-1 hover:bg-neutral-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-neutral-150 text-sm font-semibold text-neutral-600 bg-neutral-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'details' ? 'border-primary-500 text-primary-600 font-bold bg-white' : 'border-transparent hover:bg-neutral-100/50'
            }`}
          >
            <Save className="h-4 w-4 inline mr-1.5" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'tasks' ? 'border-primary-500 text-primary-600 font-bold bg-white' : 'border-transparent hover:bg-neutral-100/50'
            }`}
          >
            <ListTodo className="h-4 w-4 inline mr-1.5" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'comments' ? 'border-primary-500 text-primary-600 font-bold bg-white' : 'border-transparent hover:bg-neutral-100/50'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-1.5" />
            Comments
          </button>
        </div>

        {/* Panel Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-4">
              <Input
                label="Story Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Acceptance Criteria</label>
                <textarea
                  rows={4}
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Story Points</label>
                  <input
                    type="number"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(e.target.value === '' ? '' : Number(e.target.value))}
                    className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((member: ProjectMember) => (
                    <option key={member.id} value={member.user_id}>
                      {member.profile?.full_name || member.user_id}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => updateStoryDetails.mutate()}
                isLoading={updateStoryDetails.isPending}
                className="mt-4"
              >
                Save Details
              </Button>
            </div>
          )}

          {/* TAB 2: SUB-TASKS */}
          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-neutral-700">Story Tasks</h4>

              {/* Tasks Add Box */}
              <div className="flex gap-2">
                <Input
                  placeholder="New task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="py-1.5"
                />
                <Button
                  onClick={() => createTask.mutate()}
                  isLoading={createTask.isPending}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>

              {/* Tasks List */}
              {loadingTasks ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-6">No tasks added to this story yet.</p>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-neutral-150 rounded-lg hover:bg-neutral-50/50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={() => toggleTaskStatus.mutate(task)}
                          className="h-4 w-4 rounded border-neutral-350 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                        <span
                          className={`text-xs font-medium text-neutral-800 truncate ${
                            task.status === 'done' ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteTask.mutate(task.id)}
                        className="text-neutral-400 hover:text-danger-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-neutral-700">Discussion</h4>

              {/* Comments display */}
              {loadingComments ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-6">No comments yet. Start the conversation!</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 p-3 bg-neutral-50/70 border border-neutral-100 rounded-lg">
                      <Avatar
                        src={comment.author?.avatar_url}
                        alt={comment.author?.full_name || 'Author'}
                        size="xs"
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-850 font-sans">
                            {comment.author?.full_name || 'Unknown'}
                          </span>
                          <span className="text-[9px] text-neutral-450">
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 leading-normal whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post comment input */}
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  rows={2}
                  placeholder="Post an update or reply..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="block w-full rounded-lg border border-neutral-350 py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => createComment.mutate()}
                    isLoading={createComment.isPending}
                    size="sm"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
export default StoryDetailPanel
