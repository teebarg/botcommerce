import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import NotFound from '@/components/generic/not-found'

export type SessionContext = {
    userId: number | null;
    isImpersonating: boolean;
    impersonatedBy: string | null;
    isAdmin: boolean
    isAuthenticated: boolean;
    user: {
        firstName: string;
        lastName: string;
        image: string;
        email: string;
        role: string;
        roles: string[];
    };
};

const defaultSession: SessionContext = {
    userId: null,
    isImpersonating: false,
    impersonatedBy: null,
    isAdmin: false,
    isAuthenticated: false,
    user: {
        firstName: "",
        lastName: "",
        image: "",
        email: "",
        role: "",
        roles: [],
    },
};

export function getRouter() {
    const queryClient = new QueryClient()

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: {
            queryClient, config: {}, ...defaultSession
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