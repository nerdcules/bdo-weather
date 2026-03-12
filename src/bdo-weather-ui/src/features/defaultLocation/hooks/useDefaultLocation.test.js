import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useDefaultLocation } from './useDefaultLocation'

vi.mock('../api/getDefaultLocation', () => ({
  getDefaultLocation: vi.fn().mockResolvedValue({
    city: 'Dublin',
    country: 'IE',
    setAt: '2025-01-01T00:00:00Z',
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDefaultLocation', () => {
  it('returns location data on success', async () => {
    const { result } = renderHook(() => useDefaultLocation(), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data.city).toBe('Dublin')
  })

  it('returns null when no default location set', async () => {
    const { getDefaultLocation } = await import('../api/getDefaultLocation')
    vi.mocked(getDefaultLocation).mockResolvedValueOnce(null)

    const { result } = renderHook(() => useDefaultLocation(), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})
