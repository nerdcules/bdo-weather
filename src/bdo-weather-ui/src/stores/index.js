import { create } from 'zustand'

export const useWeatherStore = create((set) => ({
  activeCity: '',
  setActiveCity: (city) => set({ activeCity: city }),
  clearActiveCity: () => set({ activeCity: '' }),
}))

export const useSettingsStore = create((set) => ({
  unit: 'C',
  toggleUnit: () => set((state) => ({ unit: state.unit === 'C' ? 'F' : 'C' })),
}))

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: ({ message, type = 'info' }) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
