import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setDefaultLocation } from './setDefaultLocation'

vi.mock('../../../shared/api/apiClient', () => ({
  default: { put: vi.fn() },
}))

import apiClient from '../../../shared/api/apiClient'

describe('setDefaultLocation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls PUT with the correct endpoint and payload', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ city: 'London', country: 'GB', setAt: '2025-01-01T00:00:00Z' })
    await setDefaultLocation({ city: 'London' })
    expect(apiClient.put).toHaveBeenCalledWith('/api/default-location', { city: 'London' })
  })

  it('returns the API response', async () => {
    const data = { city: 'London', country: 'GB', setAt: '2025-01-01T00:00:00Z' }
    vi.mocked(apiClient.put).mockResolvedValue(data)
    const result = await setDefaultLocation({ city: 'London' })
    expect(result).toEqual(data)
  })

  it('propagates errors from the API', async () => {
    vi.mocked(apiClient.put).mockRejectedValue(new Error('Server error'))
    await expect(setDefaultLocation({ city: 'Bad' })).rejects.toThrow('Server error')
  })
})
