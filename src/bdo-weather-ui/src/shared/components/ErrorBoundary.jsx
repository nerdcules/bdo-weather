import { Component } from 'react'

/**
 * Catches render errors in the subtree and shows a fallback UI.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'An unexpected error occurred.' }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset = () => this.setState({ hasError: false, message: '' })

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <p className="text-lg font-semibold text-red-600">Something went wrong</p>
          <p className="text-sm text-gray-500">{this.state.message}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
