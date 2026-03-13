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
    const trimmed = value.trim()
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
      <div className="glass flex overflow-hidden rounded-2xl p-1 shadow-xl">
        <label htmlFor="city-search" className="sr-only">
          Search city
        </label>
        <input
          id="city-search"
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city…"
          aria-label="City name"
          aria-describedby={validationError ? 'city-search-error' : undefined}
          aria-invalid={!!validationError}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
        />
        <button
          type="button"
          onClick={submit}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 active:scale-95"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          Search
        </button>
      </div>
      {validationError && (
        <p id="city-search-error" role="alert" className="mt-2 pl-1 text-xs text-rose-400">
          {validationError}
        </p>
      )}
    </div>
  )
}
