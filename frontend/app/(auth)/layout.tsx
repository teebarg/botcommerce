import Link from "next/link";
import React from "react";

import { getSiteConfig } from "@/lib/config";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const siteConfig = await getSiteConfig();

    return (
        <div className="h-screen flex flex-col">
            <nav className="w-full max-w-md p-6 fixed top-0">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-linear-to-br from-primary to-contrast rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white">M</span>
                        </div>
                        <Link prefetch href="/">
                            <span className="text-xl font-semibold bg-clip-text text-transparent bg-linear-to-r from-primary to-contrast">
                                {siteConfig.name}
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex items-center justify-center flex-1">
                <div className="bg-card px-3 py-6 rounded-lg">{children}</div>
            </div>
        </div>
    );
}
