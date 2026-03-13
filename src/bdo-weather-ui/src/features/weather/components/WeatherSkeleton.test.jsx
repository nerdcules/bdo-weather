import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherSkeleton } from './WeatherSkeleton'

describe('WeatherSkeleton', () => {
  it('renders with an accessible label', () => {
    render(<WeatherSkeleton />)
    expect(screen.getByLabelText('Loading weather data')).toBeDefined()
  })

  it('has aria-busy attribute', () => {
    const { container } = render(<WeatherSkeleton />)
    const el = container.querySelector('[aria-busy="true"]')
    expect(el).not.toBeNull()
  })

  it('renders skeleton placeholder rows', () => {
    const { container } = render(<WeatherSkeleton />)
    const wrapper = container.querySelector('[aria-busy="true"]')
    const placeholders = wrapper.querySelectorAll('div')
    expect(placeholders.length).toBeGreaterThan(0)
  })
})
