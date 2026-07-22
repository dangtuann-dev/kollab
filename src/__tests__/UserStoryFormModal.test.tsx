import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import UserStoryFormModal from '../features/backlog/UserStoryFormModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

describe('UserStoryFormModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    projectId: 'proj-123',
    onSubmit: vi.fn().mockResolvedValue(true),
  }

  it('renders form fields correctly when open', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserStoryFormModal {...defaultProps} />
      </QueryClientProvider>
    )

    expect(screen.getByPlaceholderText(/Ví dụ: Là người dùng, tôi muốn/i)).toBeInTheDocument()
    expect(screen.getByText(/Điểm độ lớn/i)).toBeInTheDocument()
    expect(screen.getByText(/Độ ưu tiên/i)).toBeInTheDocument()
  })

  it('submits form successfully with valid inputs', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(true)
    render(
      <QueryClientProvider client={queryClient}>
        <UserStoryFormModal {...defaultProps} onSubmit={handleSubmit} />
      </QueryClientProvider>
    )

    const titleInput = screen.getByPlaceholderText(/Ví dụ: Là người dùng, tôi muốn/i)
    fireEvent.change(titleInput, { target: { value: 'User Story 1' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo User Story/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
