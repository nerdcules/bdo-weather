import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useWeatherByCity } from './useWeatherByCity'

vi.mock('../api/getWeatherByCity', () => ({
  getWeatherByCity: vi.fn().mockResolvedValue({
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
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useWeatherByCity', () => {
  it('is idle (disabled) when city is empty string', () => {
    const { result } = renderHook(() => useWeatherByCity(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('is idle when city is whitespace', () => {
    const { result } = renderHook(() => useWeatherByCity('   '), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches weather when a valid city is provided', async () => {
    const { result } = renderHook(() => useWeatherByCity('London'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data.city).toBe('London')
  })
})
