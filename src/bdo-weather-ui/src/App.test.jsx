import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./features/weather/components/WeatherSearch', () => ({
  WeatherSearch: () => <div data-testid="weather-search" />,
}))
vi.mock('./features/weather/components/WeatherDisplay', () => ({
  WeatherDisplay: () => <div data-testid="weather-display" />,
}))
vi.mock('./features/defaultLocation/components/DefaultLocationBadge', () => ({
  DefaultLocationBadge: () => <div data-testid="default-location-badge" />,
}))
vi.mock('./features/defaultLocation/components/DefaultLocationForm', () => ({
  DefaultLocationForm: () => <div data-testid="default-location-form" />,
}))
vi.mock('./shared/components/Toast', () => ({
  Toast: () => <div data-testid="toast" />,
}))
vi.mock('./shared/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }) => <>{children}</>,
}))
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

describe('App', () => {
  it('renders the page title', () => {
    render(<App />)
    expect(screen.getByText('BDO Weather')).toBeDefined()
  })

  it('renders the main feature components', () => {
    render(<App />)
    expect(screen.getByTestId('weather-search')).toBeDefined()
    expect(screen.getByTestId('weather-display')).toBeDefined()
    expect(screen.getByTestId('default-location-form')).toBeDefined()
  })
})
