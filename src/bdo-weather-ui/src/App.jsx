import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { Toast } from './shared/components/Toast'
import { WeatherSearch } from './features/weather/components/WeatherSearch'
import { WeatherDisplay } from './features/weather/components/WeatherDisplay'
import { DefaultLocationBadge } from './features/defaultLocation/components/DefaultLocationBadge'
import { DefaultLocationForm } from './features/defaultLocation/components/DefaultLocationForm'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
              <h1 className="text-lg font-bold tracking-tight text-blue-700">BDO Weather</h1>
              <DefaultLocationBadge />
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            <WeatherSearch />
            <WeatherDisplay />
            <DefaultLocationForm />
          </main>

          <Toast />
        </div>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
