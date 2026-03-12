/**
 * Tests for WeatherDisplay error state.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherDisplay } from './WeatherDisplay'
import { CityNotFoundError } from '../../../shared/api/apiClient'

vi.mock('../../../stores/index', () => ({
  useWeatherStore: (selector) => selector({ activeCity: 'Nowhere', setActiveCity: vi.fn() }),
  useSettingsStore: (selector) => selector({ unit: 'C', toggleUnit: vi.fn() }),
}))

vi.mock('../hooks/useWeatherByCity', () => ({
  useWeatherByCity: () => ({
    data: null,
    isLoading: false,
    isError: true,
    error: new CityNotFoundError('City not found.'),
    refetch: vi.fn(),
  }),
}))

describe('WeatherDisplay – error state', () => {
  it('renders the error component when fetch fails', () => {
    render(<WeatherDisplay />)
    expect(screen.getByRole('alert')).toBeDefined()
  })

  it('shows the city-not-found message', () => {
    render(<WeatherDisplay />)
    expect(screen.getByText('City not found')).toBeDefined()
  })
})
