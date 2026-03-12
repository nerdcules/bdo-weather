import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeatherError } from './WeatherError'
import { CityNotFoundError, NetworkError } from '../../../shared/api/apiClient'

describe('WeatherError', () => {
  it('shows "City not found" for CityNotFoundError', () => {
    render(<WeatherError error={new CityNotFoundError('Not found')} onRetry={vi.fn()} />)
    expect(screen.getByText('City not found')).toBeDefined()
  })

  it('shows "Connection error" for NetworkError', () => {
    render(<WeatherError error={new NetworkError('No connection')} onRetry={vi.fn()} />)
    expect(screen.getByText('Connection error')).toBeDefined()
  })

  it('shows "Something went wrong" for generic errors', () => {
    render(<WeatherError error={new Error('unexpected')} onRetry={vi.fn()} />)
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })

  it('displays the error message', () => {
    render(<WeatherError error={new NetworkError('Server is down')} onRetry={vi.fn()} />)
    expect(screen.getByText('Server is down')).toBeDefined()
  })

  it('renders a retry button for NetworkError', () => {
    render(<WeatherError error={new NetworkError('Timeout')} onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined()
  })

  it('renders a retry button for generic errors', () => {
    render(<WeatherError error={new Error('unexpected')} onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined()
  })

  it('does not render retry button for CityNotFoundError', () => {
    render(<WeatherError error={new CityNotFoundError('Not found')} onRetry={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn()
    render(<WeatherError error={new NetworkError('Err')} onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('has role="alert"', () => {
    render(<WeatherError error={new Error('x')} onRetry={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeDefined()
  })
})
