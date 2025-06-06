import Link from "next/link";
import React from "react";

import { getSiteConfig } from "@/lib/config";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const siteConfig = await getSiteConfig();

    return (
        <div className="h-screen flex flex-col">
            <nav className="w-full max-w-md px-6 py-4 fixed top-0">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white">M</span>
                        </div>
                        <Link href="/">
                            <span className="text-xl font-semibold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
                                {siteConfig.name}
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex flex-col items-center justify-center flex-1">
                <div className="max-w-md w-full bg-content1 md:rounded-2xl md:shadow-2xl transform transition-all md:hover:scale-105 duration-300 flex flex-col justify-center">
                    <div className="w-full px-6 py-12">{children}</div>
                </div>
            </div>
        </div>
    );
}
