import { Metadata } from "next";
import "styles/globals.css";
import { Lexend, Outfit } from "next/font/google";
import clsx from "clsx";
import { ThemeScript } from "@lib/theme/theme-script";
import { getCustomer } from "@lib/data";

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
    const customer = await getCustomer().catch(() => null);

    return (
        <html suppressHydrationWarning className={clsx("scroll-smooth antialiased", lexend.variable, outfit.className)} lang="en">
            <head>
                <ThemeScript />
                <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-title" content="Botmerce" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body className="min-h-screen bg-background">
                <NotificationProviders>
                    <OverlayClientProvider>
                        <div className="relative flex flex-col min-h-screen">{children}</div>
                        {!customer && <Google />}
                    </OverlayClientProvider>
                </NotificationProviders>
            </body>
        </html>
    );
}
