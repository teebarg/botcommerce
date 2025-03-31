import Link from "next/link";
import React from "react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-gradient-to-br from-primary/10 to-secondary/20 h-screen flex flex-col">
            <nav className="w-full max-w-md px-6 py-4 mb-8">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white">M</span>
                        </div>
                        <Link href="/">
                            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                Marketplace
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex flex-col items-center justify-center flex-1">
                <div className="max-w-md w-full bg-content1 md:rounded-2xl md:shadow-2xl transform transition-all md:hover:scale-105 duration-300 flex-1 md:flex-initial flex flex-col justify-center">
                    <div className="w-full px-6 md:py-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
