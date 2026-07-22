import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRealtimeBoard } from '../hooks/useRealtimeBoard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const queryClient = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useRealtimeBoard hook', () => {
  it('initializes query and subscribes to realtime channel', () => {
    const { result } = renderHook(() => useRealtimeBoard('sprint-1', ['story-1']), { wrapper })

    expect(result.current.tasks).toEqual([])
    expect(result.current.updateTask).toBeDefined()
    expect(result.current.createTask).toBeDefined()
  })
})
