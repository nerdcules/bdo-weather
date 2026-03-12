import { z } from 'zod'
import apiClient from '../../../shared/api/apiClient'

const temperatureSchema = z.object({
  current: z.number(),
  feelsLike: z.number(),
  min: z.number(),
  max: z.number(),
  unit: z.string(),
})

export const weatherResponseSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: temperatureSchema,
  humidity: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  description: z.string(),
  icon: z.string(),
  iconUrl: z.string().url(),
  sunrise: z.string(),
  sunset: z.string(),
  fetchedAt: z.string(),
})

/**
 * @param {string} city
 * @returns {Promise<import('zod').infer<typeof weatherResponseSchema>>}
 */
export const getWeatherByCity = async (city) => {
  const data = await apiClient.get('/api/weather', { params: { city } })
  return weatherResponseSchema.parse(data)
}
