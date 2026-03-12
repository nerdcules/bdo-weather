import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

// Unwrap the { data, errors } envelope on success; throw typed errors on failure.
apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (!error.response) {
      throw new NetworkError('Unable to reach the server. Please check your connection.')
    }
    const status = error.response.status
    const envelope = error.response.data
    const firstError = envelope?.errors?.[0]

    if (status === 404 || firstError?.code === 'CITY_NOT_FOUND') {
      throw new CityNotFoundError(firstError?.message ?? 'City not found.')
    }
    if (status === 429) {
      throw new NetworkError('Too many requests. Please wait a moment and try again.')
    }
    throw new UnexpectedApiError(firstError?.message ?? `Unexpected error (${status}).`)
  }
)

export default apiClient

export class CityNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CityNotFoundError'
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class UnexpectedApiError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnexpectedApiError'
  }
}
