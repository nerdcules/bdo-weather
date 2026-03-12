/**
 * Tests for WeatherDisplay loading / error / no-city states.
 * These live in a separate file so they can use different hook mocks.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherDisplay } from './WeatherDisplay'
import { CityNotFoundError } from '../../../shared/api/apiClient'

// ── no-city state ────────────────────────────────────────────────────────────
vi.mock('../../../stores/index', () => ({
  useWeatherStore: (selector) => selector({ activeCity: '', setActiveCity: vi.fn() }),
  useSettingsStore: (selector) => selector({ unit: 'C', toggleUnit: vi.fn() }),
}))

vi.mock('../hooks/useWeatherByCity', () => ({
  useWeatherByCity: () => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('WeatherDisplay – no active city', () => {
  it('shows the search prompt when no city is selected', () => {
    render(<WeatherDisplay />)
    expect(screen.getByText(/search for a city/i)).toBeDefined()
  })
})
