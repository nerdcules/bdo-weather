import { CityNotFoundError, NetworkError } from '../../../shared/api/apiClient'

/**
 * @param {{ error: Error, onRetry: () => void }} props
 */
export const WeatherError = ({ error, onRetry }) => {
  const isNotFound = error instanceof CityNotFoundError
  const isNetwork = error instanceof NetworkError

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="font-medium">
        {isNotFound ? 'City not found' : isNetwork ? 'Connection error' : 'Something went wrong'}
      </p>
      <p className="mt-1 text-sm">{error.message}</p>
      {(isNetwork || !isNotFound) && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium hover:bg-red-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        >
          Retry
        </button>
      )}
    </div>
  )
}
