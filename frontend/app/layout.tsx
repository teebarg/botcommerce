import "./globals.css";
import { Lexend, Outfit, Nunito_Sans } from "next/font/google";
import { ThemeScript } from "@lib/theme/theme-script";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import TanstackProviders from "./query-provider";

import { PushNotificationManager } from "@/components/pwa/notification-manager";
import { InstallPrompt } from "@/components/pwa/prompt";
import { getSiteConfig } from "@/lib/config";
import { ProgressBar } from "@/components/ui/progress-bar";
import { api } from "@/apis/client";
import SetShopSettings from "@/components/set-shop-settings";
import { WebSocketProvider } from "@/providers/websocket";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/auth-provider";
import { tryCatch } from "@/lib/try-catch";
import { CartProvider } from "@/providers/cart-provider";

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
                    url: "/apple-splash-750-1334.jpg",
                    media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
            ],
        },
    };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const { data: shopSettings } = await tryCatch<Record<string, string>>(api.get("/shop-settings/public"));

    return (
        <html suppressHydrationWarning className={cn("scroll-smooth antialiased", lexend.variable, outfit.className, nunitoSans.variable)} lang="en">
            <head>
                <ThemeScript />
                <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
                <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                <link href="/favicon.ico" rel="shortcut icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
                <meta content={shopSettings?.shop_name} name="apple-mobile-web-app-title" />
            </head>
            <body>
                <ProgressBar className="h-1 bg-primary">
                    <div className="relative flex flex-col min-h-screen">
                        <SetShopSettings shopSettings={shopSettings!} />
                        <PushNotificationManager />
                        <InstallPrompt />
                        <Toaster closeButton richColors duration={4000} expand={false} position="top-right" />
                        <TanstackProviders>
                            <AuthProvider>
                                <CartProvider>
                                    <WebSocketProvider>{children}</WebSocketProvider>
                                </CartProvider>
                            </AuthProvider>
                            <ReactQueryDevtools initialIsOpen={false} />
                        </TanstackProviders>
                    </div>
                </ProgressBar>
            </body>
        </html>
    );
}
