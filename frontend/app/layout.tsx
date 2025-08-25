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
import { WebSocketProvider } from "@/providers/websocket";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { StoreProvider } from "@/providers/store-provider";

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
    return (
        <html suppressHydrationWarning className={cn("scroll-smooth antialiased", lexend.variable, outfit.className, nunitoSans.variable)} lang="en">
            <head>
                <ThemeScript />
                <link href="/favicon-96x96.png" rel="icon" sizes="96x96" type="image/png" />
                <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                <link href="/favicon.ico" rel="shortcut icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
                <meta content="Shop" name="apple-mobile-web-app-title" />
                <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
                <link
                    href="splash_screens/iPhone_16_Pro_Max_landscape.png"
                    media="screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16_Pro_landscape.png"
                    media="screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"
                    media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"
                    media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
                    media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
                    media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
                    media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_11__iPhone_XR_landscape.png"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
                    media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
                    media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
                    media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/13__iPad_Pro_M4_landscape.png"
                    media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/12.9__iPad_Pro_landscape.png"
                    media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/12.9__iPad_Pro_landscape.png"
                    media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/11__iPad_Pro_M4_landscape.png"
                    media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png"
                    media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/10.9__iPad_Air_landscape.png"
                    media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/10.5__iPad_Air_landscape.png"
                    media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/10.2__iPad_landscape.png"
                    media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"
                    media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/8.3__iPad_Mini_landscape.png"
                    media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16_Pro_Max_portrait.png"
                    media="screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16_Pro_portrait.png"
                    media="screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
                    media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
                    media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
                    media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
                    media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
                    media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_11__iPhone_XR_portrait.png"
                    media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
                    media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
                    media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
                    media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/13__iPad_Pro_M4_portrait.png"
                    media="screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/12.9__iPad_Pro_portrait.png"
                    media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/11__iPad_Pro_M4_portrait.png"
                    media="screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
                    media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/10.9__iPad_Air_portrait.png"
                    media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/10.5__iPad_Air_portrait.png"
                    media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/10.2__iPad_portrait.png"
                    media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
                    media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
                <link
                    href="splash_screens/8.3__iPad_Mini_portrait.png"
                    media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    rel="apple-touch-startup-image"
                />
            </head>
            <body>
                <ProgressBar className="h-1 bg-primary">
                    <div className="relative flex flex-col min-h-screen">
                        <PushNotificationManager />
                        <InstallPrompt />
                        <Toaster closeButton richColors duration={4000} expand={false} position="top-right" />
                        <TanstackProviders>
                            <StoreProvider>
                                <AuthProvider>
                                    <CartProvider>
                                        <WebSocketProvider>{children}</WebSocketProvider>
                                    </CartProvider>
                                </AuthProvider>
                            </StoreProvider>
                            <ReactQueryDevtools initialIsOpen={false} />
                        </TanstackProviders>
                    </div>
                </ProgressBar>
            </body>
        </html>
    );
}
