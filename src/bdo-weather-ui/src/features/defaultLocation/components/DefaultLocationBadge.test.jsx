import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DefaultLocationBadge } from './DefaultLocationBadge'

const mockUseDefaultLocation = vi.fn()
const mockSetActiveCity = vi.fn()

vi.mock('../hooks/useDefaultLocation', () => ({
  useDefaultLocation: () => mockUseDefaultLocation(),
}))

vi.mock('../../../stores/index', () => ({
  useWeatherStore: (selector) => selector({ setActiveCity: mockSetActiveCity }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockUseDefaultLocation.mockReturnValue({
    data: { city: 'Dublin', country: 'IE' },
    isLoading: false,
  })
})

describe('DefaultLocationBadge', () => {
  it('shows the default city name', () => {
    render(<DefaultLocationBadge />)
    expect(screen.getByText('Dublin')).toBeDefined()
  })

  it('renders nothing when data is null', () => {
    mockUseDefaultLocation.mockReturnValue({ data: null, isLoading: false })
    const { container } = render(<DefaultLocationBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a loading placeholder while loading', () => {
    mockUseDefaultLocation.mockReturnValue({ data: null, isLoading: true })
    const { container } = render(<DefaultLocationBadge />)
    // Loading state: renders an aria-hidden pulse div, no button
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('calls setActiveCity with city name when clicked', async () => {
    render(<DefaultLocationBadge />)
    await userEvent.click(screen.getByRole('button'))
    expect(mockSetActiveCity).toHaveBeenCalledWith('Dublin')
  })

  it('has an accessible aria-label', () => {
    render(<DefaultLocationBadge />)
    expect(
      screen.getByRole('button', { name: /load default location: Dublin, IE/i }),
    ).toBeDefined()
  })
})
