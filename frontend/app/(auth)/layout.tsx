import React from "react";

import { BackButton } from "@/components/back";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 h-screen">
                <div className="absolute top-6 left-6 z-20">
                    <BackButton />
                </div>
                <div className="max-w-md w-full bg-content1 md:rounded-2xl md:shadow-2xl transform transition-all md:hover:scale-105 duration-300 flex-1 md:flex-initial flex flex-col justify-center">
                    <div className="w-full px-6 md:py-8">{children}</div>
                </div>
            </div>
        </React.Fragment>
    );
}
