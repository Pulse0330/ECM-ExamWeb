import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,

      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

// ✅ SSR-safe persistQueryClient тохиргоо
if (typeof window !== "undefined") {
  import("@tanstack/react-query-persist-client").then(
    ({ persistQueryClient }) => {
      import("@tanstack/query-sync-storage-persister").then(
        ({ createSyncStoragePersister }) => {
          persistQueryClient({
            queryClient,
            persister: createSyncStoragePersister({
              storage: window.localStorage,
            }),
          });
        }
      );
    }
  );
}
