/**
 * Tests for WeatherDisplay loading state.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherDisplay } from './WeatherDisplay'

vi.mock('../../../stores/index', () => ({
  useWeatherStore: (selector) => selector({ activeCity: 'London', setActiveCity: vi.fn() }),
  useSettingsStore: (selector) => selector({ unit: 'C', toggleUnit: vi.fn() }),
}))

vi.mock('../hooks/useWeatherByCity', () => ({
  useWeatherByCity: () => ({
    data: null,
    isLoading: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('WeatherDisplay – loading state', () => {
  it('renders the skeleton while loading', () => {
    render(<WeatherDisplay />)
    expect(screen.getByLabelText('Loading weather data')).toBeDefined()
  })
})
