import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { Toast } from './shared/components/Toast'
import { WeatherSearch } from './features/weather/components/WeatherSearch'
import { WeatherDisplay } from './features/weather/components/WeatherDisplay'
import { DefaultLocationBadge } from './features/defaultLocation/components/DefaultLocationBadge'
import { DefaultLocationForm } from './features/defaultLocation/components/DefaultLocationForm'

const queryClient = new QueryClient()

/**
 * Root application shell. Sets up React Query, the global error boundary,
 * toast notifications, and composes the weather search, display, and
 * default-location features into a single-page layout.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="relative min-h-screen text-white">
          {/* Decorative background orbs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute -left-32 top-1/2 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          <header className="glass sticky top-0 z-10">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-xl">
                  🌤️
                </div>
                <h1 className="gradient-text text-lg font-bold tracking-tight">BDO Weather</h1>
              </div>
              <DefaultLocationBadge />
            </div>
          </header>

          <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
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
