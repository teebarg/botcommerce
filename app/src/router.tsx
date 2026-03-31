import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import * as TanstackQuery from "@/providers/root-provider";

import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import NotFound from "@/components/generic/not-found";

// Create a new router instance
export const getRouter = () => {
    const rqContext = TanstackQuery.getContext();
    const session = {
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
    const config = {};

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: {
            ...rqContext,
            session,
            config,
            isAuthenticated: false,
            userId: null,
        },
        defaultPreload: "intent",
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: () => <NotFound />,
        Wrap: (props: { children: React.ReactNode }) => {
            return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>;
        },
    });

    setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

    return router;
};
