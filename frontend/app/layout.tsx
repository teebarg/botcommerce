import { Viewport } from "next";
import "public/globals.css";
import { Lexend, Outfit } from "next/font/google";
import { ThemeScript } from "@lib/theme/theme-script";
import { getCustomer } from "@lib/data";

import { NotificationProviders } from "./notistack-providers";
import OverlayClientProvider from "./overlay-providers";
import Google from "./google";

import { PushNotificationManager } from "@/components/pwa/notification-manager";
import { InstallPrompt } from "@/components/pwa/prompt";
import { cn } from "@/lib/util/cn";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";

const outfit = Outfit({ weight: ["400", "500", "600"], subsets: ["latin"] });

const lexend = Lexend({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-lexend",
});

export const metadata = {
    metadataBase: new URL(BASE_URL),
    title: "Botcommerce",
    description: "the worlds best flashcard learning system",
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

export const viewport: Viewport = {
    maximumScale: 1,
    userScalable: false,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const customer = await getCustomer().catch(() => null);

    return (
        <html suppressHydrationWarning className={cn("scroll-smooth antialiased", lexend.variable, outfit.className)} lang="en">
            <head>
                <ThemeScript />
                <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
                <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                <link href="/favicon.ico" rel="shortcut icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
                <meta content="Botmerce" name="apple-mobile-web-app-title" />
                <link href="/site.webmanifest" rel="manifest" />
            </head>
            <body className="min-h-screen bg-background">
                <NotificationProviders>
                    <OverlayClientProvider>
                        <div className="relative flex flex-col min-h-screen">
                            <PushNotificationManager />
                            <InstallPrompt />
                            {children}
                        </div>
                        {!customer && <Google />}
                    </OverlayClientProvider>
                </NotificationProviders>
            </body>
        </html>
    );
}
