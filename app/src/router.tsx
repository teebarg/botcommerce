import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import NotFound from '@/components/generic/not-found'

export type SessionContext = {
    isAuthenticated: boolean;
    userId: string | null;
    impersonated: boolean;
    impersonatedBy: string | null;
    id: string;
    user: {
        firstName: string;
        lastName: string;
        image: string;
        email: string;
        role: string;
        roles: string[];
        isAdmin: boolean;
    };
};

const defaultSession: SessionContext = {
    isAuthenticated: false,
    userId: null,
    impersonated: false,
    impersonatedBy: null,
    id: "",
    user: {
        firstName: "",
        lastName: "",
        image: "",
        email: "",
        role: "",
        roles: [],
        isAdmin: false,
    },
};

export function getRouter() {
    const queryClient = new QueryClient()

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: {
            queryClient, session: defaultSession, config: {},
            isAuthenticated: false,
            userId: null,
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