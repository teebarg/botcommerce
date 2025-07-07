"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export default function TanstackProviders({ children }: { children: ReactNode }) {
    const persister = createAsyncStoragePersister({
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
    });

    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 60 * 1000,
                        refetchOnWindowFocus: true,
                    },
                },
            })
    );

    persistQueryClient({
        queryClient: client,
        persister,
    });

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
