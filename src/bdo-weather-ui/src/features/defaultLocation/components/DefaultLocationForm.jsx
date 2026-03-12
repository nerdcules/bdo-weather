import { useState, useEffect } from 'react'
import { useDefaultLocation } from '../hooks/useDefaultLocation'
import { useSetDefaultLocation } from '../hooks/useSetDefaultLocation'

/**
 * Form allowing the user to save or update their default city.
 */
export const DefaultLocationForm = () => {
  const { data, isLoading } = useDefaultLocation()
  const { mutate, isPending } = useSetDefaultLocation()

  const [city, setCity] = useState('')
  const [error, setError] = useState('')

  // Pre-fill with existing default when loaded
  useEffect(() => {
    if (data?.city) setCity(data.city)
  }, [data?.city])

  const validate = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return 'City name is required.'
    if (!/^[a-zA-Z\s\-]+$/.test(trimmed)) return 'Only letters, spaces and hyphens are allowed.'
    if (trimmed.length > 100) return 'City name is too long.'
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate(city)
    if (err) { setError(err); return }
    setError('')
    mutate({ city: city.trim() })
  }

  if (isLoading) {
    return <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-200" aria-busy="true" aria-label="Loading default location" />
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Set default city">
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="default-city" className="text-xs font-medium text-gray-500">
            Default city
          </label>
          <input
            id="default-city"
            type="text"
            value={city}
            onChange={(e) => { setCity(e.target.value); if (error) setError('') }}
            placeholder="e.g. London"
            aria-describedby={error ? 'default-city-error' : undefined}
            aria-invalid={!!error}
            className={`rounded-lg border px-3 py-1.5 text-sm outline-none transition focus:ring-2 ${
              error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {error && (
            <p id="default-city-error" role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          aria-busy={isPending}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
