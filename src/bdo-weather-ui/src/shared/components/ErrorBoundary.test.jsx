import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

// Suppress React's error boundary console output in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

const Thrower = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test render error')
  return <div>Child content</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Child content')).toBeDefined()
  })

  it('shows error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })

  it('displays the error message', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Test render error')).toBeDefined()
  })

  it('renders a Try again button', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined()
  })

  it('resets to children after clicking Try again', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeDefined()

    // Update children to non-throwing before reset so re-render shows content
    rerender(
      <ErrorBoundary>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>,
    )

    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText('Child content')).toBeDefined()
  })
})
