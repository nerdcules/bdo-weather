import { useDefaultLocation } from '../hooks/useDefaultLocation'
import { useWeatherStore } from '../../../stores/index'

/**
 * Header badge showing the saved default city.
 * Clicking it sets that city as the active search target.
 */
export const DefaultLocationBadge = () => {
  const { data, isLoading } = useDefaultLocation()
  const setActiveCity = useWeatherStore((s) => s.setActiveCity)

  if (isLoading) return <div className="h-7 w-24 animate-pulse rounded-full bg-white/10" aria-hidden="true" />
  if (!data) return null

  const handleClick = () => setActiveCity(data.city)

  return (
    <button
      type="button"
      onClick={handleClick}
      className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-sky-300 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
      title={`Load default: ${data.city}, ${data.country}`}
      aria-label={`Load default location: ${data.city}, ${data.country}`}
    >
      <span aria-hidden="true">📍</span>
      {data.city}
    </button>
  )
}
