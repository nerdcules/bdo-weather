import apiClient from '../../../shared/api/apiClient'

/**
 * @param {{ city: string }} payload
 * @returns {Promise<{ city: string, country: string, setAt: string }>}
 */
export const setDefaultLocation = async ({ city }) => {
  return apiClient.put('/api/default-location', { city })
}
