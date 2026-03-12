import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setDefaultLocation } from '../api/setDefaultLocation'
import { DEFAULT_LOCATION_QUERY_KEY } from './useDefaultLocation'
import { useToastStore } from '../../../stores/index'

/**
 * Mutation hook to set the default city.
 * On success, invalidates the defaultLocation query and shows a toast.
 */
export const useSetDefaultLocation = () => {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: setDefaultLocation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DEFAULT_LOCATION_QUERY_KEY })
      addToast({ message: `Default location set to ${data.city}, ${data.country}.`, type: 'success' })
    },
    onError: () => {
      addToast({ message: 'Failed to save default location. Please try again.', type: 'error' })
    },
  })
}
