import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";

/**
 * Creates and configures a fresh QueryClient instance with production defaults.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Data remains fresh for 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes garbage collection window
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}
