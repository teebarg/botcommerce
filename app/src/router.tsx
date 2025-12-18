import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import * as TanstackQuery from "@/providers/root-provider";

import { routeTree } from "./routeTree.gen";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import NotFound from "@/components/generic/not-found";

// Create a new router instance
export const getRouter = () => {
    const rqContext = TanstackQuery.getContext();
    const session = null
    const config = {}

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: { ...rqContext, session, config },
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
