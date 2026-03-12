import { describe, it, expect } from 'vitest'
import { formatTemperature, formatWindDirection } from '../../shared/utils/format'

describe('formatTemperature', () => {
  it('returns Celsius string unchanged', () => {
    expect(formatTemperature(20, 'C')).toBe('20 °C')
  })

  it('converts Celsius to Fahrenheit correctly', () => {
    // 0 °C → 32 °F
    expect(formatTemperature(0, 'F')).toBe('32 °F')
  })

  it('converts 100 °C to 212 °F', () => {
    expect(formatTemperature(100, 'F')).toBe('212 °F')
  })

  it('rounds to nearest integer', () => {
    // 37 °C → 98.6 °F → rounds to 99
    expect(formatTemperature(37, 'F')).toBe('99 °F')
  })

  it('handles negative temperatures in Celsius', () => {
    expect(formatTemperature(-10, 'C')).toBe('-10 °C')
  })
})

describe('formatWindDirection', () => {
  it('north at 0°', () => expect(formatWindDirection(0)).toBe('N'))
  it('north at 360°', () => expect(formatWindDirection(360)).toBe('N'))
  it('east at 90°', () => expect(formatWindDirection(90)).toBe('E'))
  it('south at 180°', () => expect(formatWindDirection(180)).toBe('S'))
  it('west at 270°', () => expect(formatWindDirection(270)).toBe('W'))
  it('NE at 45°', () => expect(formatWindDirection(45)).toBe('NE'))
})
