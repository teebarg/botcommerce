/// <reference types="vite/client" />

import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { PushNotificationManager } from "@/components/pwa/notification-manager";
import { InstallPrompt } from "@/components/pwa/prompt";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CartProvider } from "@/providers/cart-provider";
import { StoreProvider } from "@/providers/store-provider";
import ImpersonationBanner from "@/components/impersonation-banner";
import PushPermission from "@/components/pwa/push-permission";
import { seo } from "@/utils/seo";
import NotFound from "@/components/generic/not-found";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { WebSocketProvider } from "pulsews";
import appCss from "@/styles.css?url";
import { type AuthSession, getSession, type Session } from "start-authjs";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authConfig } from "@/utils/auth";
import { getStoredTheme, ThemeProvider } from "@/providers/theme-provider";
import type { QueryClient } from "@tanstack/react-query";
import { categoriesQuery } from "@/hooks/useCategories";
import { collectionsQuery } from "@/hooks/useCollection";
import { InvalidateProvider } from "@/providers/invalidate-provider";
import { siteConfigQuery } from "@/hooks/useGeneric";

interface RouterContext {
    session: AuthSession | null;
    queryClient: QueryClient;
    config: any;
}

const fetchSession = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    const session = await getSession(request, authConfig);
    return session;
});

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async ({}) => {
        const session = (await fetchSession()) as unknown as Session;
        const _storedTheme = await getStoredTheme();
        return {
            _storedTheme,
            session,
        };
    },
    loader: async ({ context: { queryClient } }) => {
        const [categories, collections, siteConfig] = await Promise.all([
            queryClient.ensureQueryData(categoriesQuery()),
            queryClient.ensureQueryData(collectionsQuery()),
            queryClient.ensureQueryData(siteConfigQuery),
        ]);

        return {
            categories,
            collections,
            config: siteConfig,
        };
    },
    head: ({ loaderData }) => {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const title = loaderData?.config?.shop_name ?? "";
        const description = loaderData?.config?.shop_description ?? "";

        return {
            meta: [
                { charSet: "utf-8" },
                { name: "viewport", content: "width=device-width, initial-scale=1" },
                { name: "apple-mobile-web-app-capable", content: "yes" },
                { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
                ...seo({
                    title,
                    description,
                    url: `${baseUrl}}`,
                    image: "/default-og.png",
                    name: title,
                }),
            ],
            links: [
                { rel: "stylesheet", href: appCss },
                { rel: "icon", href: "/favicon-32x32.png", type: "image/png" },
                { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
                { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
            ],
        };
    },
    errorComponent: (props) => {
        return (
            <RootDocument>
                <DefaultCatchBoundary {...props} />
            </RootDocument>
        );
    },
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    const { _storedTheme } = Route.useRouteContext();
    return (
        <html suppressHydrationWarning className="antialiased">
            <head>
                <HeadContent />
                <ScriptOnce
                    children={`
                    (function() {
                        const storedTheme = ${JSON.stringify(_storedTheme)};
                        if (storedTheme === 'system') {
                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        document.documentElement.className = systemTheme;
                        } else {
                        document.documentElement.className = storedTheme;
                        }
                    })();
                    `}
                />
            </head>
            <body className="min-h-screen bg-background text-foreground">
                <ThemeProvider initialTheme={_storedTheme}>
                    <ProgressBar className="h-1 bg-primary/30">
                        <div className="relative flex flex-col min-h-screen">
                            <PushNotificationManager />
                            <PushPermission />
                            <InstallPrompt />
                            <StoreProvider>
                                <CartProvider>
                                    <WebSocketProvider
                                        url={import.meta.env.VITE_WS + "/api/ws/"}
                                        debug={true}
                                        onOpen={() => console.log("WebSocket connected!")}
                                        onClose={() => console.log("WebSocket disconnected!")}
                                    >
                                        <InvalidateProvider>{children}</InvalidateProvider>
                                        <ImpersonationBanner />
                                    </WebSocketProvider>
                                </CartProvider>
                            </StoreProvider>

                            {import.meta.env.MODE !== "production" && <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />}
                        </div>
                    </ProgressBar>
                    {/* {import.meta.env.MODE !== "production" && <TanStackRouterDevtoolsPanel />} */}
                    <Toaster closeButton richColors duration={3000} expand={false} position="top-right" />
                    <Scripts />
                </ThemeProvider>
            </body>
        </html>
    );
}
