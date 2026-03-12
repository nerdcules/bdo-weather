import { useDefaultLocation } from '../hooks/useDefaultLocation'
import { useWeatherStore } from '../../../stores/index'

/**
 * Header badge showing the saved default city.
 * Clicking it sets that city as the active search target.
 */
export const DefaultLocationBadge = () => {
  const { data, isLoading } = useDefaultLocation()
  const setActiveCity = useWeatherStore((s) => s.setActiveCity)

  if (isLoading) return <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" aria-hidden="true" />
  if (!data) return null

  const handleClick = () => setActiveCity(data.city)

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      title={`Load default: ${data.city}, ${data.country}`}
      aria-label={`Load default location: ${data.city}, ${data.country}`}
    >
      <span aria-hidden="true">📍</span>
      {data.city}
    </button>
  )
}
