import { Metadata } from "next";
import "styles/globals.css";
import { Lexend, Outfit } from "next/font/google";
import clsx from "clsx";
import { ThemeScript } from "@lib/theme/theme-script";

import { NotificationProviders } from "./notistack-providers";
import OverlayClientProvider from "./overlay-providers";
import Google from "./google";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";

const outfit = Outfit({ weight: ["400", "500", "600"], subsets: ["latin"] });

const lexend = Lexend({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-lexend",
});

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning className={clsx("scroll-smooth antialiased", lexend.variable, outfit.className)} lang="en">
            <head>
                <ThemeScript />
            </head>
            <body className="min-h-screen bg-background">
                <NotificationProviders>
                    <OverlayClientProvider>
                        <div className="relative flex flex-col min-h-screen">{children}</div>
                        <Google />
                    </OverlayClientProvider>
                </NotificationProviders>
            </body>
        </html>
    );
}
