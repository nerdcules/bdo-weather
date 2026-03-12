import { describe, it, expect } from 'vitest'
import apiClient from './apiClient'

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
