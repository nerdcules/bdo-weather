import { describe, it, expect, beforeEach } from 'vitest'
import { useWeatherStore, useSettingsStore, useToastStore } from './index'

describe('useWeatherStore', () => {
  beforeEach(() => useWeatherStore.setState({ activeCity: '' }))

  it('initial state is empty string', () => {
    expect(useWeatherStore.getState().activeCity).toBe('')
  })

  it('setActiveCity updates activeCity', () => {
    useWeatherStore.getState().setActiveCity('London')
    expect(useWeatherStore.getState().activeCity).toBe('London')
  })

  it('clearActiveCity resets activeCity to empty', () => {
    useWeatherStore.setState({ activeCity: 'Paris' })
    useWeatherStore.getState().clearActiveCity()
    expect(useWeatherStore.getState().activeCity).toBe('')
  })
})

describe('useSettingsStore', () => {
  beforeEach(() => useSettingsStore.setState({ unit: 'C' }))

  it('initial unit is C', () => {
    expect(useSettingsStore.getState().unit).toBe('C')
  })

  it('toggleUnit switches C to F', () => {
    useSettingsStore.getState().toggleUnit()
    expect(useSettingsStore.getState().unit).toBe('F')
  })

  it('toggleUnit switches F back to C', () => {
    useSettingsStore.setState({ unit: 'F' })
    useSettingsStore.getState().toggleUnit()
    expect(useSettingsStore.getState().unit).toBe('C')
  })
})

describe('useToastStore', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }))

  it('initial toasts is empty', () => {
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('addToast appends a toast with given message and type', () => {
    useToastStore.getState().addToast({ message: 'Hello!', type: 'success' })
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Hello!')
    expect(toasts[0].type).toBe('success')
  })

  it('addToast defaults type to info', () => {
    useToastStore.getState().addToast({ message: 'Info msg' })
    expect(useToastStore.getState().toasts[0].type).toBe('info')
  })

  it('removeToast removes the toast with the given id', () => {
    useToastStore.getState().addToast({ message: 'A', type: 'info' })
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
