import { useState, useEffect } from 'react'
import { useWeatherStore } from '../../../stores/index'
import { useDebounce } from '../../../shared/hooks/useDebounce'

/**
 * City search input. Submits on Enter or button click.
 * Debounces the input to avoid unnecessary renders.
 */
export const WeatherSearch = () => {
  const setActiveCity = useWeatherStore((s) => s.setActiveCity)
  const activeCity = useWeatherStore((s) => s.activeCity)

  const [value, setValue] = useState(activeCity ?? '')
  const [validationError, setValidationError] = useState('')

  // Keep input in sync when activeCity changes from outside (e.g. defaultLocation badge)
  useEffect(() => {
    if (activeCity) setValue(activeCity)
  }, [activeCity])

  const debouncedValue = useDebounce(value, 300)

  const validate = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return 'Please enter a city name.'
    if (!/^[a-zA-Z\s\-]+$/.test(trimmed)) return 'City name may only contain letters, spaces and hyphens.'
    if (trimmed.length > 100) return 'City name is too long.'
    return ''
  }

  const submit = () => {
    const trimmed = debouncedValue.trim()
    const err = validate(trimmed)
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError('')
    setActiveCity(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit()
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    if (validationError) setValidationError('')
  }

  return (
    <div className="w-full" role="search">
      <div className="flex gap-2">
        <label htmlFor="city-search" className="sr-only">
          Search city
        </label>
        <input
          id="city-search"
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter city name…"
          aria-label="City name"
          aria-describedby={validationError ? 'city-search-error' : undefined}
          aria-invalid={!!validationError}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 ${
            validationError
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-300 focus:ring-blue-300'
          }`}
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95"
          aria-label="Search"
        >
          Search
        </button>
      </div>
      {validationError && (
        <p id="city-search-error" role="alert" className="mt-1.5 text-xs text-red-600">
          {validationError}
        </p>
      )}
    </div>
  )
}
