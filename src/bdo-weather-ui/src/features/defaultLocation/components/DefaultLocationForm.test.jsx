import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DefaultLocationForm } from './DefaultLocationForm'

const mockMutate = vi.fn()
const mockUseDefaultLocation = vi.fn()
const mockUseSetDefaultLocation = vi.fn()

vi.mock('../hooks/useDefaultLocation', () => ({
  useDefaultLocation: () => mockUseDefaultLocation(),
}))

vi.mock('../hooks/useSetDefaultLocation', () => ({
  useSetDefaultLocation: () => mockUseSetDefaultLocation(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockUseDefaultLocation.mockReturnValue({ data: null, isLoading: false })
  mockUseSetDefaultLocation.mockReturnValue({ mutate: mockMutate, isPending: false })
})

describe('DefaultLocationForm', () => {
  it('renders the city input and submit button', () => {
    render(<DefaultLocationForm />)
    expect(screen.getByRole('textbox')).toBeDefined()
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined()
  })

  it('pre-fills input when data is available', () => {
    mockUseDefaultLocation.mockReturnValue({
      data: { city: 'Dublin' },
      isLoading: false,
    })
    render(<DefaultLocationForm />)
    expect(screen.getByRole('textbox').value).toBe('Dublin')
  })

  it('shows loading skeleton when loading', () => {
    mockUseDefaultLocation.mockReturnValue({ data: null, isLoading: true })
    render(<DefaultLocationForm />)
    expect(screen.queryByRole('form')).toBeNull()
  })

  it('shows validation error for empty submission', async () => {
    render(<DefaultLocationForm />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toBeDefined()
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid characters', async () => {
    render(<DefaultLocationForm />)
    await userEvent.type(screen.getByRole('textbox'), '123!!')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toBeDefined()
  })

  it('shows validation error when city is too long', async () => {
    render(<DefaultLocationForm />)
    await userEvent.type(screen.getByRole('textbox'), 'a'.repeat(101))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toBeDefined()
  })

  it('calls mutate with trimmed city on valid submission', async () => {
    render(<DefaultLocationForm />)
    await userEvent.type(screen.getByRole('textbox'), 'London')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(mockMutate).toHaveBeenCalledWith({ city: 'London' })
  })

  it('clears validation error when user starts typing', async () => {
    render(<DefaultLocationForm />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toBeDefined()
    await userEvent.type(screen.getByRole('textbox'), 'L')
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
