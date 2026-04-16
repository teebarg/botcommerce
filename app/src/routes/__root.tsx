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
import { InvalidateProvider } from "@/providers/invalidate-provider";
import PageTransitionLoader from "@/components/generic/page-transition-loader";
import PWABadge from "@/PWAbadge";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { useAppSession } from "@/utils/session";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { gtag } from "@/utils/gtag";
import { SafeAreaDebug } from "@/components/safe-area-debug";
import { getShopSettingsPublicFn } from "@/server/store.server";

function RouteChangeTracker() {
    const location = useRouterState({ select: (s) => s.location });
    useEffect(() => {
        gtag.pageView({
            page_path: location.href,
        });
    }, [location.href]);

    return null;
}

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

const fetchUser = createServerFn().handler(async (): Promise<AuthState> => {
    const session = await useAppSession();

    return {
        isAuthenticated: Boolean(session.data.id),
        userId: session.data.id || null,
        sessionClaims: {
            firstName: session.data.user?.firstName,
            lastName: session.data.user?.lastName,
            image_url: session.data.user?.image,
            email: session.data.user?.email,
            role: session.data.user?.role,
            roles: session.data.user?.roles,
        },
    };
});

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async ({ context: { queryClient }, location }) => {
        if (process.env.MAINTENANCE_MODE === "true" && location.pathname !== "/maintenance") {
            throw redirect({ to: "/maintenance" });
        }
        const [{ isAuthenticated, userId, sessionClaims }, config] = await Promise.all([
            fetchUser(),
            queryClient.ensureQueryData({
                queryKey: ["shop-settings"],
                queryFn: () => getShopSettingsPublicFn(),
                staleTime: Infinity,
            }),
        ]);
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
            impersonated: false,
            impersonatedBy: null,
        };

        return { isAuthenticated, userId, session, config };
    },
    loader: async ({ context: { config } }) => {
        return {
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
            <RouteChangeTracker />
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    const GA_ID = import.meta.env.VITE_GA_ID;
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
                {/* GA Script */}
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            window.gtag = gtag;
                            gtag('js', new Date());
                            gtag('config', '${GA_ID}');
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
                                <Toaster
                                    closeButton
                                    richColors
                                    duration={5000}
                                    expand={false}
                                    position="top-right"
                                    toastOptions={{
                                        style: {
                                            marginTop: `calc(var(--sat) + 16px)`,
                                        },
                                    }}
                                />
                                <PWABadge />
                                <SafeAreaDebug />
                                <Scripts />
                            </CartProvider>
                        </StoreProvider>
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
