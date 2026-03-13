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
    return <div className="h-[120px] w-full animate-pulse rounded-3xl bg-white/10" aria-busy="true" aria-label="Loading default location" />
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Set default city">
      <div className="glass-card rounded-3xl p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Default Location</p>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
            <label htmlFor="default-city" className="text-xs font-medium text-white/50">
              City name
            </label>
            <input
              id="default-city"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); if (error) setError('') }}
              placeholder="e.g. London"
              aria-describedby={error ? 'default-city-error' : undefined}
              aria-invalid={!!error}
              className={`glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:ring-2 ${
                error ? 'border-rose-500/50 focus:ring-rose-400' : 'focus:ring-sky-400'
              }`}
            />
            {error && (
              <p id="default-city-error" role="alert" className="text-xs text-rose-400">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-6 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 active:scale-95"
            aria-busy={isPending}
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
