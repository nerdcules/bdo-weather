import { z } from 'zod'
import { apiClient } from '../../../shared/api/apiClient'

export const DefaultLocationSchema = z.object({
  city: z.string(),
  country: z.string(),
  setAt: z.string(),
})

/**
 * @returns {Promise<import('zod').infer<typeof DefaultLocationSchema> | null>}
 */
export const getDefaultLocation = async () => {
  const data = await apiClient.get('/api/default-location')
  if (data === null) return null
  return DefaultLocationSchema.parse(data)
}
