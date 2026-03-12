import { useEffect, useState } from 'react'

/**
 * @param {string} value
 * @param {number} delay - ms
 * @returns {string}
 */
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
