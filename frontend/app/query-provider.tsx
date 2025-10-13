"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useMemo } from "react";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export default function TanstackProviders({ children }: { children: ReactNode }) {
    const client = useMemo(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 60 * 1000,
                        refetchOnWindowFocus: true,
                    },
                },
            }),
        []
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const persister = createAsyncStoragePersister({ storage: window.localStorage });
        persistQueryClient({ queryClient: client, persister });
        // no cleanup needed; persistence is benign
    }, [client]);

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
