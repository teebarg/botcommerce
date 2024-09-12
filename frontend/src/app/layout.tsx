import { Metadata } from "next";
import "styles/globals.css";
import { Lexend, Outfit } from "next/font/google";
import clsx from "clsx";

import { Providers } from "./providers";
import { NotificationProviders } from "./notistack-providers";

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
        <html
            suppressHydrationWarning
            className={clsx("dark scroll-smooth antialiased", lexend.variable, outfit.className)}
            data-mode="light"
            lang="en"
        >
            <body className="min-h-screen bg-background">
                <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
                    <NotificationProviders>
                        <div className="relative flex flex-col min-h-screen">{children}</div>
                    </NotificationProviders>
                </Providers>
            </body>
        </html>
    );
}
