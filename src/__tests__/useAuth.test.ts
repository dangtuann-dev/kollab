import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, role: null })
  })

  it('sets user and role on login state change', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      useAuthStore.setState({
        user: { id: 'usr-1', email: 'test@kollab.dev' } as any,
        role: 'product_owner',
      })
    })

    expect(result.current.user?.email).toBe('test@kollab.dev')
    expect(result.current.role).toBe('product_owner')
  })

  it('resets state on logout', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      useAuthStore.setState({
        user: { id: 'usr-1', email: 'test@kollab.dev' } as any,
        role: 'developer',
      })
    })

    act(() => {
      useAuthStore.setState({ user: null, role: null })
    })

    expect(result.current.user).toBeNull()
    expect(result.current.role).toBeNull()
  })
})
