import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import NotFound from '@/components/generic/not-found'

export function getRouter() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnMount: true,
                staleTime: 1000 * 60 * 30,
                gcTime: 1000 * 60 * 60,
            },
        },
    })
    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: {
            queryClient, config: {}
        },
        defaultPreload: 'intent',
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: () => <NotFound />,
    })
    setupRouterSsrQueryIntegration({
        router,
        queryClient,
    })

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}