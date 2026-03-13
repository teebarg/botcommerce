import { HeadContent, Outlet, Scripts, createRootRouteWithContext, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CartProvider } from "@/providers/cart-provider";
import { StoreProvider } from "@/providers/store-provider";
import ImpersonationBanner from "@/components/impersonation-banner";
import PushPermission from "@/components/push-permission";
import { seo } from "@/utils/seo";
import NotFound from "@/components/generic/not-found";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { WebSocketProvider } from "pulsews";
import appCss from "@/styles.css?url";
import { createServerFn } from "@tanstack/react-start";
import { ThemeProvider } from "@/providers/theme-provider";
import type { QueryClient } from "@tanstack/react-query";
import { categoriesQuery } from "@/hooks/useCategories";
import { collectionsQuery } from "@/hooks/useCollection";
import { InvalidateProvider } from "@/providers/invalidate-provider";
import { useEffect } from "react";
import { initPulseMetrics } from "@/utils/pulsemetric";
import PageTransitionLoader from "@/components/generic/page-transition-loader";
import PWABadge from "@/PWAbadge";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { getShopSettingsPublicFn } from "@/server/generic.server";

type SessionClaims = {
    firstName?: string;
    lastName?: string;
    image_url?: string;
    email?: string;
    role?: string;
    roles?: string[];
};

type AuthUser = {
    firstName?: string;
    lastName?: string;
    image?: string;
    email?: string;
    role?: string;
    roles?: string[];
    isAdmin?: boolean;
};

type Session = {
    id: string;
    user: AuthUser;
    accessToken: string;
    impersonated: boolean;
    impersonatedBy: string | null;
};

type AuthState = {
    isAuthenticated: boolean;
    userId: string | null;
    sessionClaims: SessionClaims | null;
};

interface RouterContext {
    isAuthenticated: boolean;
    userId: string | null;
    session: Session | null;
    queryClient: QueryClient;
    config: any;
}

export const authStateFn = createServerFn().handler(async (): Promise<AuthState> => {
    const { isAuthenticated, userId, sessionClaims } = await auth();

    return {
        isAuthenticated,
        userId,
        sessionClaims: sessionClaims as SessionClaims | null,
    };
});

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async ({ location }) => {
        if (process.env.MAINTENANCE_MODE === "true" && location.pathname !== "/maintenance") {
            throw redirect({ to: "/maintenance" });
        }
        const { isAuthenticated, userId, sessionClaims } = await authStateFn();
        const user = {
            firstName: sessionClaims?.firstName || "",
            lastName: sessionClaims?.lastName || "",
            image: sessionClaims?.image_url || "",
            email: sessionClaims?.email || "",
            role: sessionClaims?.role || "",
            roles: sessionClaims?.roles || [],
            isAdmin: sessionClaims?.roles?.includes("admin") || false,
        };

        const session: Session | null = {
            id: userId || "",
            user,
            accessToken: "",
            impersonated: false,
            impersonatedBy: null,
        };
        const config = await getShopSettingsPublicFn();

        return { isAuthenticated, userId, session, config };
    },
    loader: async ({ context: { queryClient, config } }) => {
        const [categories, collections] = await Promise.all([
            queryClient.ensureQueryData(categoriesQuery()),
            queryClient.ensureQueryData(collectionsQuery())
        ]);

        return {
            categories,
            collections,
            config,
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
                { name: "mobile-web-app-capable", content: "yes" },
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
            <PageTransitionLoader />
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initPulseMetrics();
    }, []);
    return (
        <html suppressHydrationWarning>
            <head>
                <HeadContent />
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="theme-color" content="#0f172a" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=false, viewport-fit=cover" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <script src="https://pub-f4e5ec522d104f0c94def43905ff791e.r2.dev/sdk.js" onError={(e) => console.error("Failed to load SDK:", e)} />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.addEventListener('beforeinstallprompt', (e) => {
                            e.preventDefault();
                            window.deferredPrompt = e;
                            // Dispatch a custom event so React can "wake up" and see it
                            window.dispatchEvent(new CustomEvent('pwa-install-available'));
                        });
                        `,
                    }}
                />
            </head>
            <body className="min-h-screen">
                <ClerkProvider>
                    <ThemeProvider>
                        <StoreProvider>
                            <CartProvider>
                                <div className="relative">
                                    <PushPermission />
                                    <WebSocketProvider
                                        url={import.meta.env.VITE_WS + "/api/ws/"}
                                        debug={true}
                                        onOpen={() => console.log("WebSocket connected!")}
                                        onClose={() => console.log("WebSocket disconnected!")}
                                    >
                                        <InvalidateProvider>{children}</InvalidateProvider>
                                        <ImpersonationBanner />
                                    </WebSocketProvider>
                                    {import.meta.env.MODE !== "production" && (
                                        <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
                                    )}
                                </div>
                                {/* {import.meta.env.MODE !== "production" && <TanStackRouterDevtoolsPanel />} */}
                                <Toaster closeButton richColors duration={5000} expand={false} position="top-right" />
                                <PWABadge />
                                <Scripts />
                            </CartProvider>
                        </StoreProvider>
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
