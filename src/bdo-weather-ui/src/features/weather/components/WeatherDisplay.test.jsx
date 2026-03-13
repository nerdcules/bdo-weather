import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherDisplay } from './WeatherDisplay'

// Stub all external deps
vi.mock('../../../stores/index', () => ({
  useWeatherStore: (selector) => selector({ activeCity: 'London', setActiveCity: vi.fn() }),
  useSettingsStore: (selector) => selector({ unit: 'C', toggleUnit: vi.fn() }),
}))

vi.mock('../hooks/useWeatherByCity', () => ({
  useWeatherByCity: () => ({
    data: {
      city: 'London',
      country: 'GB',
      temperature: { current: 15, feelsLike: 13, min: 10, max: 18 },
      weather: { description: 'clear sky', icon: '01d' },
      humidity: 60,
      wind: { speed: 5.5, deg: 270 },
      sunrise: '2025-01-01T07:00:00Z',
      sunset: '2025-01-01T17:00:00Z',
      timezone: 'Europe/London',
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('WeatherDisplay', () => {
  it('displays the city name', () => {
    render(<WeatherDisplay />)
    expect(screen.getByText('London')).toBeDefined()
  })

  it('displays the country', () => {
    render(<WeatherDisplay />)
    expect(screen.getByText('GB')).toBeDefined()
  })

  it('displays the temperature', () => {
    render(<WeatherDisplay />)
    expect(screen.getByText('15 °C')).toBeDefined()
  })

  it('displays the weather description', () => {
    render(<WeatherDisplay />)
    expect(screen.getByText('clear sky')).toBeDefined()
  })

  it('shows the unit toggle button', () => {
    render(<WeatherDisplay />)
    expect(screen.getByRole('button', { name: /switch to fahrenheit/i })).toBeDefined()
  })
})
