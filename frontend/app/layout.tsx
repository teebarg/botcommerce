import "./globals.css";
import type { Viewport } from "next";

import { Outfit, Nunito_Sans, Lexend } from "next/font/google";
import { ThemeScript } from "@lib/theme/theme-script";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "@next/third-parties/google";

import TanstackProviders from "./query-provider";

import { PushNotificationManager } from "@/components/pwa/notification-manager";
import { InstallPrompt } from "@/components/pwa/prompt";
import { getSiteConfig } from "@/lib/config";
import { ProgressBar } from "@/components/ui/progress-bar";
import { WebSocketProvider } from "@/providers/websocket";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/providers/cart-provider";
import { StoreProvider } from "@/providers/store-provider";
import ImpersonationBanner from "@/components/impersonation-banner";
import PushPermission from "@/components/pwa/push-permission";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const outfit = Outfit({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-outfit", display: "swap" });

const lexend = Lexend({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-lexend",
});

export const nunitoSans = Nunito_Sans({
    subsets: ["latin"],
    variable: "--font-nunito",
    display: "swap",
});

export async function generateMetadata() {
    const siteConfig = await getSiteConfig();

    return {
        metadataBase: new URL(BASE_URL),
        title: {
            template: `%s | ${siteConfig.name}`,
            default: siteConfig.name,
        },
        description: siteConfig.description,
        openGraph: {
            title: `${siteConfig.name}`,
            description: `${siteConfig.description}`,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
            siteName: `${siteConfig.name}`,
            images: [
                {
                    url: "/default-og.png",
                    width: 1200,
                    height: 630,
                    alt: `${siteConfig.name}`,
                },
            ],
            locale: "en_NG",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${siteConfig.name}`,
            description: `${siteConfig.description}`,
            images: ["/default-og.png"],
        },
        icons: {
            icon: [{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }],
            apple: [{ url: "/apple-touch-icon.png" }],
        },
        appleTouchIcon: "/apple-touch-icon.png",
        appleWebApp: {
            capable: true,
            statusBarStyle: "black-translucent",
            startupImage: [
                {
                    url: "/apple_splash_portrait.png",
                    media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/apple_splash_landscape.png",
                    media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
            ],
        },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning className={cn("scroll-smooth antialiased", outfit.variable, nunitoSans.variable, lexend.variable)} lang="en">
            <head>
                <ThemeScript />
                <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
                <link href="/favicon.ico" rel="icon" type="image/x-icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
                <meta content="Shop" name="apple-mobile-web-app-title" />
                <meta content="yes" name="apple-mobile-web-app-capable" />
                <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style" />
            </head>
            <body>
                <ProgressBar className="h-1 bg-primary/30">
                    <div className="relative flex flex-col min-h-screen">
                        <PushNotificationManager />
                        <PushPermission />
                        <InstallPrompt />
                        <Toaster closeButton richColors duration={3000} expand={false} position="top-right" />
                        <TanstackProviders>
                            <StoreProvider>
                                <SessionProvider>
                                    <CartProvider>
                                        <WebSocketProvider>
                                            {children}
                                            <ImpersonationBanner />
                                        </WebSocketProvider>
                                    </CartProvider>
                                </SessionProvider>
                            </StoreProvider>
                            {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
                        </TanstackProviders>
                    </div>
                </ProgressBar>
                {/* Google Analytics - show only in production */}
                {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />}
            </body>
        </html>
    );
}
