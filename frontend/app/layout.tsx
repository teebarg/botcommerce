import "./globals.css";
import type { Viewport } from "next";

import { Lexend, Outfit, Nunito_Sans } from "next/font/google";
import { ThemeScript } from "@lib/theme/theme-script";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";

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
        icons: {
            icon: [{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }],
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
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning className={cn("scroll-smooth antialiased", lexend.variable, outfit.className, nunitoSans.variable)} lang="en">
            <head>
                <ThemeScript />
                <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
                <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                <link href="/favicon.ico" rel="shortcut icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
                <meta content="Shop" name="apple-mobile-web-app-title" />
                <meta content="yes" name="apple-mobile-web-app-capable" />
                <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style" />
            </head>
            <body>
                <ProgressBar className="h-1 bg-primary">
                    <div className="relative flex flex-col min-h-screen">
                        <PushNotificationManager />
                        <InstallPrompt />
                        <Toaster closeButton richColors duration={4000} expand={false} position="top-right" />
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
                            <ReactQueryDevtools initialIsOpen={false} />
                        </TanstackProviders>
                    </div>
                </ProgressBar>
            </body>
        </html>
    );
}
