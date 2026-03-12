import { useState } from 'react'

/**
 * @param {{ src: string, alt: string, className?: string }} props
 */
export const WeatherIcon = ({ src, alt, className = 'h-16 w-16' }) => {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <span className={`${className} flex items-center justify-center rounded-full bg-gray-100 text-2xl`} aria-label={alt}>
        🌡️
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  )
}
