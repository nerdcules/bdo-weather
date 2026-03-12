import { useQuery } from '@tanstack/react-query'
import { getDefaultLocation } from '../api/getDefaultLocation'

export const DEFAULT_LOCATION_QUERY_KEY = ['defaultLocation']

/**
 * Fetches the user's saved default city.
 * Returns null if no default has been set.
 */
export const useDefaultLocation = () =>
  useQuery({
    queryKey: DEFAULT_LOCATION_QUERY_KEY,
    queryFn: getDefaultLocation,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  })
