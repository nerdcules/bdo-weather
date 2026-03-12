import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeatherByCity } from './getWeatherByCity'

vi.mock('../../../shared/api/apiClient', () => ({
  default: { get: vi.fn() },
}))

import apiClient from '../../../shared/api/apiClient'

const validResponse = {
  city: 'London',
  country: 'GB',
  temperature: { current: 15, feelsLike: 13, min: 10, max: 18, unit: 'celsius' },
  humidity: 70,
  windSpeed: 5.5,
  windDirection: 270,
  description: 'clear sky',
  icon: '01d',
  iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
  sunrise: '2025-01-01T07:00:00Z',
  sunset: '2025-01-01T17:00:00Z',
  fetchedAt: '2025-01-01T12:00:00Z',
}

describe('getWeatherByCity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls the correct API endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(validResponse)
    await getWeatherByCity('London')
    expect(apiClient.get).toHaveBeenCalledWith('/api/weather', { params: { city: 'London' } })
  })

  it('returns parsed weather data on success', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(validResponse)
    const result = await getWeatherByCity('London')
    expect(result.city).toBe('London')
    expect(result.temperature.current).toBe(15)
  })

  it('throws Zod error when response is invalid', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ invalid: 'shape' })
    await expect(getWeatherByCity('London')).rejects.toThrow()
  })

  it('propagates API errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))
    await expect(getWeatherByCity('London')).rejects.toThrow('Network error')
  })
})
