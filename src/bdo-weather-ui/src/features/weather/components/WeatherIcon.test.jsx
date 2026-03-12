import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeatherIcon } from './WeatherIcon'

describe('WeatherIcon', () => {
  it('renders an img with the given src and alt', () => {
    render(<WeatherIcon src="https://example.com/icon.png" alt="Sunny" />)
    const img = screen.getByAltText('Sunny')
    expect(img).toBeDefined()
    expect(img.getAttribute('src')).toBe('https://example.com/icon.png')
  })

  it('applies the default className', () => {
    render(<WeatherIcon src="x.png" alt="icon" />)
    expect(screen.getByAltText('icon').className).toContain('h-16 w-16')
  })

  it('applies a custom className', () => {
    render(<WeatherIcon src="x.png" alt="icon" className="h-8 w-8" />)
    expect(screen.getByAltText('icon').className).toContain('h-8 w-8')
  })

  it('shows emoji fallback when image fails to load', () => {
    render(<WeatherIcon src="bad.png" alt="Bad icon" />)
    fireEvent.error(screen.getByAltText('Bad icon'))
    // After error, falls back to a span with the alt label
    expect(screen.getByLabelText('Bad icon')).toBeDefined()
    expect(screen.queryByAltText('Bad icon')).toBeNull()
  })
})
