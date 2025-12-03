import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import * as TanstackQuery from "@/providers/root-provider";

import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
    const rqContext = TanstackQuery.getContext();
    const session = null

    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        context: { ...rqContext, session },
        defaultPreload: "intent",
        Wrap: (props: { children: React.ReactNode }) => {
            return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>;
        },
    });

    setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

    return router;
};
