import { useWeatherStore, useSettingsStore } from '../../../stores/index'
import { useWeatherByCity } from '../hooks/useWeatherByCity'
import { WeatherSkeleton } from './WeatherSkeleton'
import { WeatherError } from './WeatherError'
import { WeatherIcon } from './WeatherIcon'
import { formatTemperature, formatWindSpeed, formatWindDirection, formatTime } from '../../../shared/utils/format'

/**
 * Detail card for the currently active city.
 */
export const WeatherDisplay = () => {
  const city = useWeatherStore((s) => s.activeCity)
  const unit = useSettingsStore((s) => s.unit)
  const toggleUnit = useSettingsStore((s) => s.toggleUnit)
  const { data, isLoading, isError, error, refetch } = useWeatherByCity(city)

  if (!city) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
        Search for a city to see weather information.
      </div>
    )
  }

  if (isLoading) return <WeatherSkeleton />
  if (isError) return <WeatherError error={error} onRetry={refetch} />

  const { city: name, country, temperature, weather, humidity, wind, sunrise, sunset, timezone } = data

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`

  return (
    <article aria-label={`Weather for ${name}, ${country}`} className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {name}, <span className="text-gray-500">{country}</span>
          </h2>
          <p className="text-sm capitalize text-gray-500">{weather.description}</p>
        </div>
        <WeatherIcon src={iconUrl} alt={weather.description} className="h-16 w-16" />
      </div>

      {/* Temperature + unit toggle */}
      <div className="flex items-end gap-3">
        <span className="text-6xl font-semibold text-gray-900">
          {formatTemperature(temperature.current, unit)}
        </span>
        <button
          type="button"
          onClick={toggleUnit}
          className="mb-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          °{unit === 'C' ? 'F' : 'C'}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Feels like {formatTemperature(temperature.feelsLike, unit)} &mdash;
        High {formatTemperature(temperature.max, unit)} / Low {formatTemperature(temperature.min, unit)}
      </p>

      {/* Detail grid */}
      <dl className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
        <DetailItem label="Humidity" value={`${humidity}%`} />
        <DetailItem label="Wind" value={`${formatWindSpeed(wind.speed)} ${formatWindDirection(wind.deg)}`} />
        <DetailItem label="Sunrise" value={formatTime(sunrise, timezone)} />
        <DetailItem label="Sunset" value={formatTime(sunset, timezone)} />
      </dl>
    </article>
  )
}

/** @param {{ label: string, value: string }} props */
const DetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-gray-700">{value}</dd>
  </div>
)
