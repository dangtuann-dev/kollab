import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (cacheTime renamed to gcTime in React Query v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
