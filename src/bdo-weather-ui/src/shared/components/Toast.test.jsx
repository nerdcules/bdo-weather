import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from './Toast'
import { useToastStore } from '../../stores/index'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('Toast', () => {
  it('renders nothing when there are no toasts', () => {
    render(<Toast />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders a toast with message', () => {
    useToastStore.getState().addToast({ message: 'Saved!', type: 'success' })
    render(<Toast />)
    expect(screen.getByText('Saved!')).toBeDefined()
  })

  it('renders multiple toasts', () => {
    useToastStore.getState().addToast({ message: 'First', type: 'info' })
    useToastStore.getState().addToast({ message: 'Second', type: 'error' })
    render(<Toast />)
    expect(screen.getByText('First')).toBeDefined()
    expect(screen.getByText('Second')).toBeDefined()
  })

  it('removes toast when dismiss button is clicked', async () => {
    useToastStore.getState().addToast({ message: 'Click to dismiss', type: 'info' })
    render(<Toast />)
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByText('Click to dismiss')).toBeNull()
  })

  it('auto-dismisses toast after 4 seconds', () => {
    vi.useFakeTimers()
    useToastStore.getState().addToast({ message: 'Auto gone', type: 'info' })
    render(<Toast />)
    expect(screen.getByText('Auto gone')).toBeDefined()

    act(() => {
      vi.advanceTimersByTime(4100)
    })

    expect(screen.queryByText('Auto gone')).toBeNull()
    vi.useRealTimers()
  })
})
