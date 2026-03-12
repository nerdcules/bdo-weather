import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeatherSearch } from './WeatherSearch'

// Stub Zustand stores
vi.mock('../../../stores/index', () => ({
  useWeatherStore: (selector) =>
    selector({ activeCity: '', setActiveCity: vi.fn(), clearActiveCity: vi.fn() }),
}))

describe('WeatherSearch', () => {
  it('renders the search input and button', () => {
    render(<WeatherSearch />)
    expect(screen.getByRole('searchbox')).toBeDefined()
    expect(screen.getByRole('button', { name: /search/i })).toBeDefined()
  })

  it('shows a validation error when submitted with empty input', async () => {
    render(<WeatherSearch />)
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(await screen.findByRole('alert')).toBeDefined()
  })

  it('shows validation error for invalid characters', async () => {
    render(<WeatherSearch />)
    await userEvent.type(screen.getByRole('searchbox'), '123!!')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(await screen.findByRole('alert')).toBeDefined()
  })

  it('accepts a valid city name without error', async () => {
    render(<WeatherSearch />)
    await userEvent.type(screen.getByRole('searchbox'), 'London')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    // No alert should be present
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
