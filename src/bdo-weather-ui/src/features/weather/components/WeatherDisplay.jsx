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
      <div className="glass-card rounded-3xl p-12 text-center">
        <div className="mb-4 text-5xl" aria-hidden="true">🌍</div>
        <p className="text-sm text-white/40">Search for a city to see weather information.</p>
      </div>
    )
  }

  if (isLoading) return <WeatherSkeleton />
  if (isError) return <WeatherError error={error} onRetry={refetch} />

  const { city: name, country, temperature, weather, humidity, wind, sunrise, sunset, timezone } = data

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`

  return (
    <article aria-label={`Weather for ${name}, ${country}`} className="glass-card rounded-3xl overflow-hidden">
      <div className="p-6 space-y-5">

        {/* Location + icon */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">{name}</h2>
            <p className="mt-0.5 text-sm font-medium text-sky-300">{country}</p>
            <p className="mt-1 text-sm capitalize text-white/50">{weather.description}</p>
          </div>
          <WeatherIcon src={iconUrl} alt={weather.description} className="h-20 w-20 drop-shadow-2xl" />
        </div>

        {/* Temperature + unit toggle */}
        <div className="flex items-end gap-3">
          <span className="gradient-text text-7xl font-extrabold leading-none tracking-tighter">
            {formatTemperature(temperature.current, unit)}
          </span>
          <button
            type="button"
            onClick={toggleUnit}
            className="glass mb-2 rounded-full px-3 py-1 text-sm font-medium text-sky-300 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>

        <p className="text-sm text-white/40">
          Feels like {formatTemperature(temperature.feelsLike, unit)}
          <span className="mx-2 opacity-50">·</span>
          High {formatTemperature(temperature.max, unit)}
          <span className="mx-2 opacity-50">·</span>
          Low {formatTemperature(temperature.min, unit)}
        </p>

        {/* Detail grid */}
        <dl className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
          <DetailItem label="Humidity" value={`${humidity}%`} icon="💧" />
          <DetailItem label="Wind" value={`${formatWindSpeed(wind.speed)} ${formatWindDirection(wind.deg)}`} icon="🌬️" />
          <DetailItem label="Sunrise" value={formatTime(sunrise, timezone)} icon="🌅" />
          <DetailItem label="Sunset" value={formatTime(sunset, timezone)} icon="🌇" />
        </dl>

      </div>
    </article>
  )
}

/** @param {{ label: string, value: string, icon: string }} props */
const DetailItem = ({ label, value, icon }) => (
  <div className="glass rounded-2xl p-3.5">
    <div className="mb-2 flex items-center gap-1.5">
      <span className="text-base leading-none" aria-hidden="true">{icon}</span>
      <dt className="text-xs font-semibold uppercase tracking-widest text-white/35">{label}</dt>
    </div>
    <dd className="text-sm font-bold text-white">{value}</dd>
  </div>
)
