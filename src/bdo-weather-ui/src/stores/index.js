import { create } from 'zustand'

/** Active city string — set by WeatherSearch (or the default-location badge) and read by WeatherDisplay to drive React Query fetches. */
export const useWeatherStore = create((set) => ({
  activeCity: '',
  setActiveCity: (city) => set({ activeCity: city }),
  clearActiveCity: () => set({ activeCity: '' }),
}))

/** Temperature unit preference ('C' or 'F'). Persists for the session; toggled by the button in WeatherDisplay. */
export const useSettingsStore = create((set) => ({
  unit: 'C',
  toggleUnit: () => set((state) => ({ unit: state.unit === 'C' ? 'F' : 'C' })),
}))

/** Toast notification queue. Use addToast() anywhere; the Toast component auto-dismisses entries after 4 seconds. */
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: ({ message, type = 'info' }) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
