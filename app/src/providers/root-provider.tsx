import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function getContext() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 60 * 24, // 24hrs — serve cache on remount
                gcTime: 1000 * 60 * 60 * 24, // 24hrs — keep in memory after unmount
                refetchOnWindowFocus: false, // don't refetch when tab regains focus
                refetchOnReconnect: false, // don't refetch on network reconnect
                retry: 1, // default is 3, which hammers failing endpoints
            },
        },
    });
    return {
        queryClient,
    };
}

export function Provider({ children, queryClient }: { children: React.ReactNode; queryClient: QueryClient }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
