import { CityNotFoundError, NetworkError } from '../../../shared/api/apiClient'

/**
 * @param {{ error: Error, onRetry: () => void }} props
 */
export const WeatherError = ({ error, onRetry }) => {
  const isNotFound = error instanceof CityNotFoundError
  const isNetwork = error instanceof NetworkError

  return (
    <div role="alert" className="glass-card rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl">
          {isNotFound ? '🔍' : '⚠️'}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-rose-300">
            {isNotFound ? 'City not found' : isNetwork ? 'Connection error' : 'Something went wrong'}
          </p>
          <p className="mt-1 text-sm text-white/50">{error.message}</p>
          {(isNetwork || !isNotFound) && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 glass rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
