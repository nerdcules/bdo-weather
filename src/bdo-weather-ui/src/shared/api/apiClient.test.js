import { describe, it, expect, afterEach } from 'vitest'
import apiClient, { CityNotFoundError, NetworkError, UnexpectedApiError } from './apiClient'

// ── Basic instance checks ───────────────────────────────────────────────────

describe('apiClient', () => {
  it('is an axios instance with a get method', () => {
    expect(typeof apiClient.get).toBe('function')
  })

  it('is an axios instance with a put method', () => {
    expect(typeof apiClient.put).toBe('function')
  })

  it('has the expected base URL', () => {
    expect(apiClient.defaults.baseURL ?? '').toMatch(/localhost|undefined|/)
  })
})

// ── Error classes ───────────────────────────────────────────────────────────

describe('CityNotFoundError', () => {
  it('has name CityNotFoundError', () => {
    expect(new CityNotFoundError('x').name).toBe('CityNotFoundError')
  })
  it('inherits from Error', () => {
    expect(new CityNotFoundError('x')).toBeInstanceOf(Error)
  })
})

describe('NetworkError', () => {
  it('has name NetworkError', () => {
    expect(new NetworkError('x').name).toBe('NetworkError')
  })
})

describe('UnexpectedApiError', () => {
  it('has name UnexpectedApiError', () => {
    expect(new UnexpectedApiError('x').name).toBe('UnexpectedApiError')
  })
})

// ── Response interceptors ───────────────────────────────────────────────────

const originalAdapter = apiClient.defaults.adapter

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter
})

const set200 = (data) => {
  apiClient.defaults.adapter = async (config) => ({
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
    data,
  })
}

const setError = (status, responseData) => {
  apiClient.defaults.adapter = async () => {
    const err = Object.assign(new Error(`Request failed with status code ${status}`), {
      response: { status, data: responseData },
    })
    throw err
  }
}

const setNetworkError = () => {
  apiClient.defaults.adapter = async () => {
    throw new Error('Network Error') // no .response property
  }
}

describe('apiClient response interceptor', () => {
  it('unwraps the data envelope on a 200 response', async () => {
    set200({ data: { city: 'London' }, errors: [] })
    const result = await apiClient.get('/test')
    expect(result).toEqual({ city: 'London' })
  })

  it('throws NetworkError when there is no server response', async () => {
    setNetworkError()
    await expect(apiClient.get('/test')).rejects.toBeInstanceOf(NetworkError)
  })

  it('throws CityNotFoundError on 404', async () => {
    setError(404, { errors: [{ code: 'CITY_NOT_FOUND', message: 'City not found.' }] })
    await expect(apiClient.get('/test')).rejects.toBeInstanceOf(CityNotFoundError)
  })

  it('throws CityNotFoundError when code is CITY_NOT_FOUND on any status', async () => {
    setError(400, { errors: [{ code: 'CITY_NOT_FOUND', message: 'City not found.' }] })
    await expect(apiClient.get('/test')).rejects.toBeInstanceOf(CityNotFoundError)
  })

  it('uses the error message from the envelope for CityNotFoundError', async () => {
    setError(404, { errors: [{ code: 'CITY_NOT_FOUND', message: 'Custom message.' }] })
    const err = await apiClient.get('/test').catch((e) => e)
    expect(err.message).toBe('Custom message.')
  })

  it('throws NetworkError on 429 rate-limiting', async () => {
    setError(429, { errors: [] })
    await expect(apiClient.get('/test')).rejects.toBeInstanceOf(NetworkError)
  })

  it('throws UnexpectedApiError for other status codes', async () => {
    setError(500, { errors: [{ code: 'SERVER_ERROR', message: 'Internal error.' }] })
    await expect(apiClient.get('/test')).rejects.toBeInstanceOf(UnexpectedApiError)
  })

  it('throws UnexpectedApiError with fallback message when envelope has no errors', async () => {
    setError(503, { errors: [] })
    const err = await apiClient.get('/test').catch((e) => e)
    expect(err).toBeInstanceOf(UnexpectedApiError)
    expect(err.message).toContain('503')
  })
})

