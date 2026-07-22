import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import KanbanBoard from '../features/sprint/KanbanBoard'

describe('KanbanBoard Component', () => {
  const mockTasks = [
    { id: 't1', title: 'Task 1', status: 'todo', user_story_id: 's1' },
    { id: 't2', title: 'Task 2', status: 'in_progress', user_story_id: 's1' },
    { id: 't3', title: 'Task 3', status: 'done', user_story_id: 's1' },
  ] as any[]

  const mockStories = [{ id: 's1', title: 'Story 1' }] as any[]

  it('renders all 3 Kanban columns with task titles', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        stories={mockStories}
        onUpdateStatus={vi.fn()}
        onOpenDetails={vi.fn()}
        onCreateTask={vi.fn()}
      />
    )

    expect(screen.getByText(/Cần làm \(To Do\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Đang làm \(In Progress\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Hoàn thành \(Done\)/i)).toBeInTheDocument()

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })
})
