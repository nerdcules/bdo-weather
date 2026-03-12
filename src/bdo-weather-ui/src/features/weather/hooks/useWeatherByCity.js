import { useQuery } from '@tanstack/react-query'
import { getWeatherByCity } from '../api/getWeatherByCity'

/**
 * @param {string} city
 */
export const useWeatherByCity = (city) =>
  useQuery({
    queryKey: ['weather', city],
    queryFn: () => getWeatherByCity(city),
    enabled: Boolean(city?.trim()),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
