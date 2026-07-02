import { HeadContent, Outlet, Scripts, createRootRouteWithContext, redirect, useLoaderData } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CartProvider } from "@/providers/cart-provider";
import { StoreProvider } from "@/providers/store-provider";
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
import { AppSession, useAppSession } from "@/utils/session";
import { getSessionId } from "@/utils";
import { Analytics } from "@vercel/analytics/react";
import { ShopSettings } from "@/schemas";
import { useSettingsQuery } from "@/hooks/useGeneric";
import { useEffect, useState } from "react";
import ImpersonationBanner from "@/components/impersonation-banner";
import { SafeAreaDebug } from "@/components/safe-area-debug";


interface RouterContext extends AppSession {
    queryClient: QueryClient;
    config: any;
}

const fetchUser = createServerFn().handler(async (): Promise<AppSession> => {
    const {data} = await useAppSession();
    return {
        ...data,
        isAdmin: ["ADMIN"].includes(data?.user?.role || ""),
        isAuthenticated: Boolean(data.userId)
    }
});

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async ({ context: { queryClient }, location }) => {
        if (process.env.MAINTENANCE_MODE === "true" && location.pathname !== "/maintenance") {
            throw redirect({ to: "/maintenance" });
        }
        const [session, settings] = await Promise.all([
            fetchUser(),
            queryClient.ensureQueryData(useSettingsQuery()),
        ]);

        const config = Object.fromEntries(
            settings.map((setting: ShopSettings) => [setting.key, setting.value])
        );

        return { ...session, config };
    },
    loader: async ({ context }) => {
        return {
            config: context.config ?? {},
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
                    url: `${baseUrl}`,
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
    // const GA_ID = import.meta.env.VITE_GA_ID;
    const [localSessionId, setLocalSessionId] = useState<string | null>(null);
    const loaderData = useLoaderData({ from: Route.id }) as any;
    const config = loaderData?.config ?? {};

    useEffect(() => {
        setLocalSessionId(getSessionId());
    }, []);
    return (
        <html suppressHydrationWarning>
            <head>
                <HeadContent />
                <meta name="theme-color" content="#0f172a" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
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
                {/* <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
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
                /> */}
            </head>
            <body className="min-h-screen">
                <ClerkProvider>
                    <ThemeProvider>
                        <StoreProvider config={config}>
                            <CartProvider>
                                <div className="relative">
                                    <PushPermission />
                                    {localSessionId && (
                                        <WebSocketProvider
                                            url={`${import.meta.env.VITE_WS}/api/ws/?session_id=${localSessionId}`}
                                            debug={true}
                                            onOpen={() => console.log("WebSocket connected!")}
                                            onClose={() => console.log("WebSocket disconnected!")}
                                        >
                                            <InvalidateProvider>{children}</InvalidateProvider>
                                        </WebSocketProvider>
                                    )}
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
                                            marginTop: "var(--sat)",
                                        },
                                    }}
                                />
                                <PWABadge />
                                <SafeAreaDebug />
                                <ImpersonationBanner />
                                {process.env.NODE_ENV === "production" && <Analytics />}
                                <Scripts />
                            </CartProvider>
                        </StoreProvider>
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
