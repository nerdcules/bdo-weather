import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSetDefaultLocation } from './useSetDefaultLocation'
import { useToastStore } from '../../../stores/index'

vi.mock('../api/setDefaultLocation', () => ({
  setDefaultLocation: vi.fn().mockResolvedValue({
    city: 'London',
    country: 'GB',
    setAt: '2025-01-01T00:00:00Z',
  }),
}))

vi.mock('../api/getDefaultLocation', () => ({
  getDefaultLocation: vi.fn().mockResolvedValue(null),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSetDefaultLocation', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }))

  it('exposes a mutate function', () => {
    const { result } = renderHook(() => useSetDefaultLocation(), {
      wrapper: createWrapper(),
    })
    expect(typeof result.current.mutate).toBe('function')
  })

  it('adds a success toast after successful mutation', async () => {
    const { result } = renderHook(() => useSetDefaultLocation(), {
      wrapper: createWrapper(),
    })
    act(() => result.current.mutate({ city: 'London' }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const toasts = useToastStore.getState().toasts
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].message).toContain('London')
  })

  it('adds an error toast when mutation fails', async () => {
    const { setDefaultLocation } = await import('../api/setDefaultLocation')
    vi.mocked(setDefaultLocation).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useSetDefaultLocation(), {
      wrapper: createWrapper(),
    })
    act(() => result.current.mutate({ city: 'London' }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(useToastStore.getState().toasts[0].type).toBe('error')
  })
})
