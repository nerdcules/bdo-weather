import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDefaultLocation } from './getDefaultLocation'

vi.mock('../../../shared/api/apiClient', () => ({
  default: { get: vi.fn() },
}))

import apiClient from '../../../shared/api/apiClient'

describe('getDefaultLocation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls the correct API endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      city: 'Dublin',
      country: 'IE',
      setAt: '2025-01-01T00:00:00Z',
    })
    await getDefaultLocation()
    expect(apiClient.get).toHaveBeenCalledWith('/api/default-location')
  })

  it('returns parsed location on success', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      city: 'Dublin',
      country: 'IE',
      setAt: '2025-01-01T00:00:00Z',
    })
    const result = await getDefaultLocation()
    expect(result.city).toBe('Dublin')
    expect(result.country).toBe('IE')
  })

  it('returns null when API returns null', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(null)
    const result = await getDefaultLocation()
    expect(result).toBeNull()
  })

  it('throws when response shape is invalid', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ bad: 'data' })
    await expect(getDefaultLocation()).rejects.toThrow()
  })
})
